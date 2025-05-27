import speech from '@google-cloud/speech';

// Instantiates a client.
const client = new speech.SpeechClient();


export async function transcribeSpeech(url: string) {
    console.log("Starting transcription...");
    const audio = {
        uri: url,
    };

    // Transcribes your audio file using the specified configuration.
    const config = {
        model: "latest_long",
        encoding: 8,
        sampleRateHertz: 16000, 
        enableWordTimeOffsets: true,
    };

    const request = {
        audio: audio,
        config: config,
    };

    try {
        // Detects speech in the audio file. This creates a recognition job that you
        // can wait for now, or get its result later.
        const [operation] = await client.longRunningRecognize(request);
        console.log('Waiting for operation to complete...');
        
        // Get a Promise representation of the final result of the job.
        const [response] = await operation.promise();
        console.log('Transcription completed successfully.');
        
        // Check if results exist before processing
        const transcription = response.results
                                    ?.map(result => result?.alternatives?.[0]?.transcript)
                                    .join('\n');
        return transcription || 'No transcription available.';
    } catch (error) {
        console.error('Error during transcription:', error);
        throw error;
    }
}