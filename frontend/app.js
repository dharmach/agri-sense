document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    const state = {
        visual: { captured: false, dataUrl: null },
        ndvi: { fetched: false, data: null },
        voice: { recorded: false, text: null },
        isDiagnosing: false
    };

    // --- DOM Elements ---
    // Visual
    const video = document.getElementById('camera-feed');
    const canvas = document.getElementById('camera-snapshot');
    const overlay = document.getElementById('camera-overlay');
    const btnToggleCam = document.getElementById('btn-toggle-camera');
    const btnCapture = document.getElementById('btn-capture');
    const statusVisual = document.getElementById('status-visual');
    let stream = null;

    // NDVI
    const btnFetchNdvi = document.getElementById('btn-fetch-ndvi');
    const ndviScore = document.getElementById('ndvi-score');
    const ndviDesc = document.getElementById('ndvi-desc');
    const statusNdvi = document.getElementById('status-ndvi');

    // Voice
    const btnRecord = document.getElementById('btn-record');
    const micWrapper = document.getElementById('mic-wrapper');
    const waveforms = document.getElementById('waveforms');
    const transcriptBox = document.getElementById('transcript-box');
    const transcriptText = document.getElementById('transcript-text');
    const statusVoice = document.getElementById('status-voice');
    const voiceInstruction = document.getElementById('voice-instruction');
    let isRecording = false;

    // Action & Results
    const btnDiagnose = document.getElementById('btn-diagnose');
    const loadingOverlay = document.getElementById('loading-overlay');
    const panelResults = document.getElementById('panel-results');
    const btnCloseResults = document.getElementById('btn-close-results');

    // Generate fake waveforms
    for(let i=0; i<15; i++) {
        const bar = document.createElement('div');
        bar.className = 'bar';
        waveforms.appendChild(bar);
    }

    // --- Core Functions ---
    const checkReady = () => {
        if (state.visual.captured && state.ndvi.fetched && state.voice.recorded) {
            btnDiagnose.disabled = false;
        }
    };

    // --- Camera Logic ---
    btnToggleCam.addEventListener('click', async () => {
        if (stream) {
            // Turn off
            stream.getTracks().forEach(track => track.stop());
            stream = null;
            video.srcObject = null;
            overlay.style.display = 'flex';
            btnCapture.disabled = true;
            btnToggleCam.innerHTML = '<i class="fa-solid fa-power-off"></i> Turn On';
        } else {
            // Turn on
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                video.srcObject = stream;
                overlay.style.display = 'none';
                canvas.style.display = 'none';
                video.style.display = 'block';
                btnCapture.disabled = false;
                btnToggleCam.innerHTML = '<i class="fa-solid fa-power-off"></i> Turn Off';
                
                // Reset state if trying again
                state.visual.captured = false;
                statusVisual.textContent = 'Pending';
                statusVisual.className = 'status-badge pending';
                btnDiagnose.disabled = true;
            } catch (err) {
                console.error("Camera access denied or error:", err);
                alert("Cannot access camera. Please check permissions.");
            }
        }
    });

    btnCapture.addEventListener('click', () => {
        if (!stream) return;
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg');
        state.visual.dataUrl = dataUrl;
        state.visual.captured = true;
        
        video.style.display = 'none';
        canvas.style.display = 'block';
        
        statusVisual.textContent = 'Captured';
        statusVisual.className = 'status-badge ready';
        checkReady();
    });

    // --- NDVI Logic ---
    btnFetchNdvi.addEventListener('click', () => {
        btnFetchNdvi.disabled = true;
        btnFetchNdvi.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Fetching...';
        
        // Mocking API call to Earth Engine/Database
        setTimeout(() => {
            const mockScore = 0.42; // Low NDVI score indicating stress
            state.ndvi.data = mockScore;
            state.ndvi.fetched = true;
            
            ndviScore.textContent = mockScore.toFixed(2);
            ndviScore.className = 'ndvi-value-circle low';
            ndviDesc.innerHTML = 'Low metabolic vigor detected in this sector.<br><small>Correlates with potential stress.</small>';
            
            statusNdvi.textContent = 'Fetched';
            statusNdvi.className = 'status-badge ready';
            
            btnFetchNdvi.innerHTML = '<i class="fa-solid fa-satellite-dish"></i> Fetch';
            btnFetchNdvi.disabled = false;
            
            checkReady();
        }, 1500);
    });

    // --- Voice Logic (Mocked Speech Recognition) ---
    btnRecord.addEventListener('mousedown', startRecording);
    btnRecord.addEventListener('touchstart', (e) => { e.preventDefault(); startRecording(); });
    
    btnRecord.addEventListener('mouseup', stopRecording);
    btnRecord.addEventListener('touchend', (e) => { e.preventDefault(); stopRecording(); });

    let waveInterval;
    function startRecording() {
        if(isRecording) return;
        isRecording = true;
        micWrapper.classList.add('recording');
        waveforms.classList.add('active');
        voiceInstruction.textContent = 'Recording... release to process.';
        
        // Animate waveforms
        const bars = document.querySelectorAll('.bar');
        waveInterval = setInterval(() => {
            bars.forEach(bar => {
                bar.style.height = Math.floor(Math.random() * 40 + 5) + 'px';
            });
        }, 100);
    }

    function stopRecording() {
        if(!isRecording) return;
        isRecording = false;
        clearInterval(waveInterval);
        micWrapper.classList.remove('recording');
        waveforms.classList.remove('active');
        voiceInstruction.textContent = 'Processing context...';
        
        // Reset bars
        document.querySelectorAll('.bar').forEach(b => b.style.height = '10px');
        
        // Mock processing delay
        setTimeout(() => {
            state.voice.text = "Kemarin hujan deras. Tanaman ini sudah dipupuk nitrogen 2 minggu lalu tapi daunnya mulai bercak kuning hitam.";
            state.voice.recorded = true;
            
            transcriptBox.style.display = 'block';
            transcriptText.textContent = `"${state.voice.text}"`;
            voiceInstruction.textContent = 'Context saved to Farm Memory.';
            
            statusVoice.textContent = 'Recorded';
            statusVoice.className = 'status-badge ready';
            
            checkReady();
        }, 1000);
    }

    // --- Diagnose / Integration ---
    btnDiagnose.addEventListener('click', async () => {
        loadingOverlay.classList.remove('hidden');
        
        // Prepare Payload
        const payload = {
            image: state.visual.dataUrl, // Base64
            ndvi: state.ndvi.data,
            voiceContext: state.voice.text
        };
        
        console.log("Sending Payload to Agent:", payload);
        
        try {
            const response = await fetch('/diagnose', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            
            // Assuming the agent returns a comprehensive text block, we can render it.
            // For now, we will just dump the result into the first box if it's unstructured,
            // or we could parse it if it follows the a) b) c) structure.
            const resultText = data.result || data;

            loadingOverlay.classList.add('hidden');
            panelResults.classList.remove('hidden');
            
            // Helper function to extract content between tags
            const extractSection = (text, sectionTag, nextTags = []) => {
                const startIndex = text.indexOf(sectionTag);
                if (startIndex === -1) return null;
                
                let endIndex = text.length;
                for (const tag of nextTags) {
                    const tagIndex = text.indexOf(tag, startIndex + sectionTag.length);
                    if (tagIndex !== -1 && tagIndex < endIndex) {
                        endIndex = tagIndex;
                    }
                }
                
                return text.substring(startIndex + sectionTag.length, endIndex).trim();
            };

            const cause = extractSection(resultText, "[CAUSE]", ["[BIO]", "[CHEM]"]) || resultText;
            const bio = extractSection(resultText, "[BIO]", ["[CHEM]", "[CAUSE]"]) || "No specific biological recommendation provided.";
            const chem = extractSection(resultText, "[CHEM]", ["[BIO]", "[CAUSE]"]) || "No specific chemical recommendation provided.";

            document.getElementById('res-cause').innerHTML = `
                <strong>Diagnosis Summary</strong><br>
                ${cause.replace(/\n/g, '<br>')}
            `;
            
            document.getElementById('res-bio').innerHTML = bio.replace(/\n/g, '<br>');
            
            document.getElementById('res-chem').innerHTML = chem.replace(/\n/g, '<br>');
            
            panelResults.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            console.error("Diagnosis failed:", error);
            loadingOverlay.classList.add('hidden');
            alert("Failed to connect to the agent backend: " + error.message);
        }
    });

    btnCloseResults.addEventListener('click', () => {
        panelResults.classList.add('hidden');
    });
});
