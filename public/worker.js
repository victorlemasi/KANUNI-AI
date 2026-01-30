
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

// Skip local checks since we are running in browser via CDN
env.allowLocalModels = false;
env.useBrowserCache = true;

class AnalysisPipeline {
    static task = 'text-classification';
    static model = 'Xenova/bert-base-uncased';
    // We will need a mapping for our specific PPDA pillars if we want exact parity, 
    // but for now let's stick to the "Meta model" request for the synthesis part which was the heavy lifter.

    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

class SynthesisPipeline {
    static task = 'summarization';
    // Meta's BART model (Distilled version for speed/size balance)
    static model = 'Xenova/distilbart-cnn-6-6';

    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            // Load the Meta model
            this.instance = await pipeline(this.task, this.model, {
                progress_callback,
                quantized: true // Ensure 8-bit quantization for lower memory on client
            });
        }
        return this.instance;
    }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    const { text, type } = event.data;

    try {
        if (type === 'analyze') {
            // 1. Run Classification (Simulating the 6 pillars)
            // Note: Real BERT classification would need the specific fine-tuned model. 
            // For this migration, we will focus on the Synthesis part which was causing the OOM.
            // We can use the server-side Regex for "compliance" and use the Client AI for "Analysis/Summary".

            // 2. Run Synthesis (The Meta Model)
            self.postMessage({ status: 'initiate', message: 'Loading Meta BART model...' });

            const synthesizer = await SynthesisPipeline.getInstance((data) => {
                self.postMessage({
                    status: 'progress',
                    ...data
                });
            });

            self.postMessage({ status: 'analyzing', message: 'generating audit opinion...' });

            // Generate the opinion/summary
            // We treat the text as input for the BART model
            const output = await synthesizer(text, {
                max_new_tokens: 150,
                temperature: 0.7,
                do_sample: true,
                top_k: 50,
            });

            self.postMessage({
                status: 'complete',
                output: output[0].summary_text
            });
        }
    } catch (error) {
        self.postMessage({
            status: 'error',
            error: error.message
        });
    }
});
