/*
	Steps to use:
		1. Open the second item
		2. Click Start Button
		3. F12 + Clear console
		4. Click Previous Button
		
	Version:
		v1: support to extract the data
		v2: support for new application without expiry Date
		v3: support to extract the data of 'Address for Service'
		v4: support to extract the data of 'Status', 'Trade Mark Text', 'Name', Agent's Details
*/

window.addEventListener('DOMContentLoaded', function() {
    //console.log('A Page URL:', window.location.href);
    logTradeMarkDetails();

    // Create and append Start and Stop buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.position = 'fixed';
    buttonContainer.style.right = '20px';
    buttonContainer.style.top = '80%';
    buttonContainer.style.transform = 'translateY(-50%)';
    buttonContainer.style.zIndex = '1000';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.flexDirection = 'column';
    buttonContainer.style.gap = '10px';

    const startButton = document.createElement('button');
    startButton.textContent = 'Start';
    startButton.style.padding = '10px 20px';
    startButton.style.backgroundColor = '#4CAF50';
    startButton.style.color = 'white';
    startButton.style.border = 'none';
    startButton.style.borderRadius = '5px';
    startButton.style.cursor = 'pointer';
    startButton.style.fontSize = '16px';
    startButton.addEventListener('click', function() {
        manualClickTriggered = true;
        hasLogTradeMarkDetailsHeader = true;
        console.log('Start button clicked, enabling auto-click');
    });

    const stopButton = document.createElement('button');
    stopButton.textContent = 'Stop';
    stopButton.style.padding = '10px 20px';
    stopButton.style.backgroundColor = '#f44336';
    stopButton.style.color = 'white';
    stopButton.style.border = 'none';
    stopButton.style.borderRadius = '5px';
    stopButton.style.cursor = 'pointer';
    stopButton.style.fontSize = '16px';
    stopButton.addEventListener('click', function() {
        manualClickTriggered = false;
        console.log('Stop button clicked, disabling auto-click');
    });

    buttonContainer.appendChild(startButton);
    buttonContainer.appendChild(stopButton);
    document.body.appendChild(buttonContainer);
});

// Flag to track if auto-click is enabled
let manualClickTriggered = false;
let hasLogTradeMarkDetailsHeader = false;
let lastTradeMarkNo = '';

function logTradeMarkDetailsHeader() {
	console.log('|Trade Mark No|Status|Trade Mark Text|Expiry Date|Name|Address|Address for Service|Agent\'s Details');
}

// Function to extract and log Trade Mark No., Status, Trade Mark Text, Expiry Date, Name, Address, Address for Service, Agent's Details
function logTradeMarkDetails() {
	if (hasLogTradeMarkDetailsHeader){
		logTradeMarkDetailsHeader();
		hasLogTradeMarkDetailsHeader = false;
	}	
	
    try {
        let tradeMarkNo = '';
        let status = '';
        let tradeMarkText = '';
        let expiryDate = '';
        let name = '';
        let address = '';
        let addressForService = '';
        let agentDetails = '';

        // Get all <dt> elements
        const dtElements = document.querySelectorAll('dl dt');
        dtElements.forEach(dt => {
            const text = dt.textContent.trim();
            if (text.includes('Trade Mark No.')) {
                tradeMarkNo = dt.nextElementSibling?.textContent.trim() || '';
            } else if (text.includes('Status')) {
                status = dt.nextElementSibling?.textContent.trim() || '';
            } else if (text.includes('Trade Mark Text')) {
                tradeMarkText = dt.nextElementSibling?.textContent.trim() || '';
            } else if (text.includes('Expiry Date')) {
                expiryDate = dt.nextElementSibling?.textContent.trim() || '';
            } else if (text.includes('Name')) {
                name = dt.nextElementSibling?.textContent.trim() || '';
            } else if (text.includes('Address:') && !text.includes('Address for Service')) {
                address = dt.nextElementSibling?.querySelector('div')?.textContent.trim() || '';
            } else if (text.includes('Address for Service')) {
                addressForService = dt.nextElementSibling?.querySelector('div')?.textContent.trim() || '';
            } else if (text.includes('Agent\'s Details') || text.includes('Agent')) {
                agentDetails = dt.nextElementSibling?.querySelector('div')?.textContent.trim() || '';
            }
        });

        // Check if Trade Mark No. has updated
        if (tradeMarkNo && (tradeMarkNo !== lastTradeMarkNo || lastTradeMarkNo === '')) {
            // Log in the format: TradeMarkNo|ExpiryDate|Address|AddressForService
            if (tradeMarkNo && address) {
                console.log(`|${tradeMarkNo}|${status}|${tradeMarkText}|${expiryDate}|${name}|${address}|${addressForService}|${agentDetails}`);
                lastTradeMarkNo = tradeMarkNo; // Update lastTradeMarkNo
            } else {
                console.log('Missing data:', { tradeMarkNo, expiryDate, address, addressForService });
            }
        } else {
            //console.log('Trade Mark No. not updated, retrying in 1 second:', tradeMarkNo);
            setTimeout(logTradeMarkDetails, 1000); // Retry after 1 second
        }
    } catch (error) {
        console.error('Error extracting trade mark details:', error);
        setTimeout(logTradeMarkDetails, 1000); // Retry after 1 second on error
    }
}

// Function to auto-click the "Next" button
function autoClickNextButton() {
    if (!manualClickTriggered) return; // Only auto-click if enabled
    const nextButton = document.querySelector('button[title="下一個記錄"]');
    if (nextButton) {
        setTimeout(() => {
            //console.log('Auto-clicking Next button');
            nextButton.click();
        }, 2000); // 2-second delay to allow page to load
    } else {
        console.log('Next button not found, stopping auto-click');
        manualClickTriggered = false; // Stop auto-clicking if button is missing
    }
}

// Use MutationObserver to detect SPA navigation
let lastUrl = window.location.href;
new MutationObserver(function() {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
        //console.log('B Page URL:', currentUrl);
        logTradeMarkDetails();
        lastUrl = currentUrl;
        autoClickNextButton(); // Auto-click after URL change
    }
}).observe(document, { subtree: true, childList: true });

// Poll for URL changes as a backup
setInterval(function() {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
        //console.log('C Page URL:', currentUrl);
        logTradeMarkDetails();
        lastUrl = currentUrl;
        autoClickNextButton(); // Auto-click after URL change
    }
}, 100);