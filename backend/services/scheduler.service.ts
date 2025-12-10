import { CloudSchedulerClient } from '@google-cloud/scheduler';
import path from 'path';

// Load credentials
const CREDENTIALS_PATH = path.join(__dirname, '../certs/google-cloud-credentials.json');
const PROJECT_ID = process.env.GCP_PROJECT_ID;
const LOCATION_ID = process.env.GCP_LOCATION_ID || 'us-central1';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'; // Should be ngrok or public URL

if (!PROJECT_ID) {
    console.warn('GCP_PROJECT_ID is not set in .env. Cloud Scheduler will fail.');
}

const client = new CloudSchedulerClient({
    keyFilename: CREDENTIALS_PATH
});

export class SchedulerService {
    private parent = client.locationPath(PROJECT_ID || '', LOCATION_ID);

    async createJob(
        name: string,
        description: string,
        schedule: string,
        payload: { type: string, channel: string }
    ) {
        // Construct the fully qualified job name.
        // Format: projects/[PROJECT_ID]/locations/[LOCATION_ID]/jobs/[JOB_ID]
        // We use a safe ID based on the input name or current timestamp if collision avoiding is needed.
        // Here we expect 'name' to be unique enough (e.g. from frontend ID).
        const jobName = client.jobPath(PROJECT_ID || '', LOCATION_ID, name);

        const job = {
            name: jobName,
            description,
            schedule,
            timeZone: 'America/Bogota', // Default to Colombia/EST or make configurable
            httpTarget: {
                uri: `${API_BASE_URL}/api/notifications/trigger`,
                httpMethod: 'POST' as const,
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-token': process.env.API_SECRET_TOKEN || ''
                },
                body: Buffer.from(JSON.stringify(payload)).toString('base64'),
            },
        };

        try {
            const [response] = await client.createJob({
                parent: this.parent,
                job,
            });
            console.log(`Created job: ${response.name}`);
            return response;
        } catch (error: any) {
            // If job already exists, we might want to update it
            if (error.code === 6) { // ALREADY_EXISTS
                console.log('Job exists, updating...');
                return this.updateJob(name, description, schedule, payload);
            }
            throw error;
        }
    }

    async updateJob(
        name: string,
        description: string,
        schedule: string,
        payload: { type: string, channel: string }
    ) {
        const jobName = client.jobPath(PROJECT_ID || '', LOCATION_ID, name);
        const job = {
            name: jobName,
            description,
            schedule,
            timeZone: 'America/Bogota',
            httpTarget: {
                uri: `${API_BASE_URL}/api/notifications/trigger`,
                httpMethod: 'POST' as const,
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-token': process.env.API_SECRET_TOKEN || ''
                },
                body: Buffer.from(JSON.stringify(payload)).toString('base64'),
            },
        };

        const [response] = await client.updateJob({ job });
        console.log(`Updated job: ${response.name}`);
        return response;
    }

    async listJobs() {
        try {
            const [jobs] = await client.listJobs({
                parent: this.parent,
            });
            return jobs;
        } catch (error) {
            console.error('Error listing jobs:', error);
            throw error;
        }
    }

    async deleteJob(name: string) {
        const jobName = client.jobPath(PROJECT_ID || '', LOCATION_ID, name);
        try {
            await client.deleteJob({
                name: jobName,
            });
            console.log(`Deleted job: ${jobName}`);
            return true;
        } catch (error) {
            console.error('Error deleting job:', error);
            return false;
        }
    }

    // Pause/Resume if needed
    async pauseJob(name: string) {
        const jobName = client.jobPath(PROJECT_ID || '', LOCATION_ID, name);
        await client.pauseJob({ name: jobName });
    }

    async resumeJob(name: string) {
        const jobName = client.jobPath(PROJECT_ID || '', LOCATION_ID, name);
        await client.resumeJob({ name: jobName });
    }
}

export const schedulerService = new SchedulerService();
