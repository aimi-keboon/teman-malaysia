// netlify/functions/create-billplz-bill.js
// This serverless function handles Billplz API calls securely

const https = require('https');
const querystring = require('querystring');

// Billplz configuration
const BILLPLZ_API_KEY = process.env.BILLPLZ_API_KEY; // Set in Netlify environment variables
const BILLPLZ_X_SIGNATURE_KEY = process.env.BILLPLZ_X_SIGNATURE_KEY;
const BILLPLZ_COLLECTION_ID = process.env.BILLPLZ_COLLECTION_ID;
const BILLPLZ_API_URL = 'https://www.billplz.com/api/v3/bills';

exports.handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { billplzData, bookingData } = JSON.parse(event.body);

        // Validate required data
        if (!billplzData || !bookingData) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required data' })
            };
        }

        // Prepare Billplz bill data
        const billData = {
            collection_id: BILLPLZ_COLLECTION_ID,
            description: billplzData.description,
            email: billplzData.email,
            name: billplzData.name,
            amount: billplzData.amount,
            callback_url: billplzData.callback_url,
            redirect_url: billplzData.redirect_url,
            reference_1_label: billplzData.reference_1_label,
            reference_1: billplzData.reference_1,
            reference_2_label: billplzData.reference_2_label,
            reference_2: billplzData.reference_2
        };

        // Create Billplz bill
        const billResponse = await createBillplzBill(billData);

        // Store booking data (you might want to save this to a database)
        // For now, we'll just return the bill URL
        const bookingReference = generateBookingReference();
        
        // Save booking data to a simple storage solution
        await saveBookingData({
            ...bookingData,
            bill_id: billResponse.id,
            booking_reference: bookingReference,
            payment_status: 'pending',
            created_at: new Date().toISOString()
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                url: billResponse.url,
                bill_id: billResponse.id,
                booking_reference: bookingReference
            })
        };

    } catch (error) {
        console.error('Error creating Billplz bill:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to create payment bill',
                message: error.message 
            })
        };
    }
};

function createBillplzBill(billData) {
    return new Promise((resolve, reject) => {
        const postData = querystring.stringify(billData);
        
        const options = {
            hostname: 'www.billplz.com',
            port: 443,
            path: '/api/v3/bills',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData),
                'Authorization': `Basic ${Buffer.from(BILLPLZ_API_KEY + ':').toString('base64')}`
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    
                    if (res.statusCode === 200) {
                        resolve(response);
                    } else {
                        reject(new Error(`Billplz API error: ${response.error || data}`));
                    }
                } catch (error) {
                    reject(new Error(`Failed to parse Billplz response: ${error.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error(`Request error: ${error.message}`));
        });

        req.write(postData);
        req.end();
    });
}

function generateBookingReference() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `TM${timestamp}${random}`.toUpperCase();
}

async function saveBookingData(bookingData) {
    // For GitHub Pages deployment, you might want to use:
    // 1. Airtable API
    // 2. Google Sheets API
    // 3. Firebase Firestore
    // 4. FaunaDB
    // 5. Or any other cloud database
    
    // Example with Airtable (you'll need to set up environment variables)
    if (process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID) {
        return saveToAirtable(bookingData);
    }
    
    // For demo purposes, just log the data
    console.log('Booking data to save:', bookingData);
    return Promise.resolve();
}

async function saveToAirtable(bookingData) {
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
    const AIRTABLE_TABLE_NAME = 'Bookings';

    const airtableData = {
        records: [{
            fields: {
                'Booking Reference': bookingData.booking_reference,
                'Full Name': bookingData.full_name,
                'Email': bookingData.email,
                'Phone': bookingData.phone,
                'Service': bookingData.service_name,
                'Package': bookingData.package_name,
                'Amount': bookingData.total_amount,
                'Preferred Date': bookingData.preferred_date,
                'Preferred Time': bookingData.preferred_time,
                'Address': bookingData.address,
                'Special Requirements': bookingData.special_requirements || '',
                'Emergency Contact': bookingData.emergency_contact || '',
                'Bill ID': bookingData.bill_id,
                'Payment Status': bookingData.payment_status,
                'Created At': bookingData.created_at
            }
        }]
    };

    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(airtableData);
        
        const options = {
            hostname: 'api.airtable.com',
            port: 443,
            path: `/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`Airtable API error: ${data}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}