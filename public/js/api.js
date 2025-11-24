const API_BASE_URL = '';

/**
 * Wrapper Fetch API kustom
 * @param {string} endpoint
 * @param {object} options 
 */
async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    options.headers = { ...defaultHeaders, ...options.headers };

    if (options.body && typeof options.body !== 'string') {
        options.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(url, options);

        let data;
        
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            data = await response.json();
        } else {
            if (!response.ok) {
                 throw new Error(`Server Error (Non-JSON): ${response.status} ${response.statusText}`);
            } else {
                throw new Error("Server Error: Respons tidak terduga dari server. (Bukan JSON)");
            }
        }
        if (!response.ok) {
            const errorMessage = data.message || `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
        }

        return data; 

    } catch (error) {
        console.error('Fetch Error:', error.message);
        throw error; 
    }
}