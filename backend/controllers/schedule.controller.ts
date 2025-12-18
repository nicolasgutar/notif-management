import { Request, Response } from 'express';
import { schedulerService } from '../services/scheduler.service';

// Helper to convert Google Protobuf Timestamp to ISO String
const formatGoogleTimestamp = (timestamp: any): string | null => {
    if (!timestamp) return null;

    // If it's already a string, return it
    if (typeof timestamp === 'string') return timestamp;

    // Use seconds/nanos if available
    if (timestamp.seconds || timestamp.nanos) {
        const seconds = Number(timestamp.seconds || 0);
        const nanos = Number(timestamp.nanos || 0);
        // Create date (seconds * 1000 + nanos / 1000000)
        return new Date(seconds * 1000 + nanos / 1_000_000).toISOString();
    }

    return null;
};

export const getSchedules = async (req: Request, res: Response) => {
    try {
        const jobs = await schedulerService.listJobs();

        // Transform Google Cloud Jobs to our frontend Schedule format
        const schedules = jobs.map((job: any) => {
            // Job name format: projects/.../jobs/ID
            const id = job.name?.split('/').pop() || '';

            // Parse payload from body
            let payload: any = {};
            if (job.httpTarget?.body) {
                try {
                    const json = Buffer.from(job.httpTarget.body as string, 'base64').toString('utf-8');
                    payload = JSON.parse(json);
                } catch (e) {
                    console.warn('Failed to parse job body', e);
                }
            }

            return {
                id,
                notificationId: payload.type || 'unknown',
                channelId: payload.channel || '',
                cronExpression: job.schedule,
                enabled: job.state === 'ENABLED',
                lastRun: formatGoogleTimestamp(job.lastAttemptTime),
                nextRun: formatGoogleTimestamp(job.scheduleTime),
                description: job.description
            };
        });

        res.json({ data: schedules });
    } catch (error) {
        console.error('Error listing schedules:', error);
        res.status(500).json({ error: 'Failed to list schedules' });
    }
};

export const createSchedule = async (req: Request, res: Response) => {
    const { notificationId, cronExpression, channelId } = req.body;

    if (!notificationId || !cronExpression) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const name = `sched-${Date.now()}`;
    const description = `Schedule for ${notificationId} via ${channelId || 'IN_APP'}`;
    const payload = {
        type: notificationId,
        channel: channelId || 'IN_APP'
    };

    try {
        await schedulerService.createJob(name, description, cronExpression, payload);
        res.json({ message: 'Schedule created', id: name });
    } catch (error) {
        console.error('Error creating schedule:', error);
        res.status(500).json({ error: 'Failed to create schedule' });
    }
};

export const deleteSchedule = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await schedulerService.deleteJob(id);
        res.json({ message: 'Schedule deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete schedule' });
    }
};

export const toggleSchedule = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { enabled } = req.body;

    try {
        if (enabled) {
            await schedulerService.resumeJob(id);
        } else {
            await schedulerService.pauseJob(id);
        }
        res.json({ message: `Schedule ${enabled ? 'resumed' : 'paused'}` });
    } catch (error) {
        console.error(`Error toggling schedule ${id}:`, error);
        res.status(500).json({ error: 'Failed to toggle schedule' });
    }
};
