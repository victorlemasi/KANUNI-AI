
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

// Skip local checks since we are running in browser via CDN
env.allowLocalModels = false;
env.useBrowserCache = true;

class AnalysisPipeline {
    static task = 'zero-shot-classification';
    static model = 'Xenova/bart-large-mnli';

    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model, {
                progress_callback,
                quantized: true
            });
        }
        return this.instance;
    }
}

class SynthesisPipeline {
    static task = 'summarization';
    // Meta's BART model (Large version for better accuracy)
    static model = 'Xenova/bart-large-cnn';

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
            // 1. Run Classification (The 3 Pillars)
            self.postMessage({ status: 'initiate', message: 'Loading Classifier (~350MB)...' });

            const classifier = await AnalysisPipeline.getInstance((data) => {
                self.postMessage({ status: 'progress', ...data });
            });

            self.postMessage({ status: 'analyzing', message: 'Analyzing Governance Pillars...' });

            const labels = ['Decision Intelligence', 'Compliance Automation', 'HITL Governance'];
            const classificationResult = await classifier(text, labels, { multi_label: true });

            // Normalize scores to object map
            const pillarScores = {};
            classificationResult.labels.forEach((label, index) => {
                // Convert simple key name for UI (camelCase)
                const key = label === 'Decision Intelligence' ? 'decisionIntelligence' :
                    label === 'Compliance Automation' ? 'complianceAutomation' :
                        'hitlGovernance';
                pillarScores[key] = classificationResult.scores[index];
            });

            // Send partial result based on classification
            self.postMessage({
                status: 'classification_complete',
                output: pillarScores
            });

            // 2. Run Synthesis (The Meta Model)
            self.postMessage({ status: 'initiate', message: 'Loading Generator (~350MB)...' });

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
