# Federal Policy Analyst API

REST API that provides AI-powered federal policy analysis. Connect this to your Copilot Studio agents to give them access to expert policy guidance.

## Endpoint

**Production:** `https://analyst.turek.in`

## Adding to Copilot Studio

1. Open your agent in Copilot Studio
2. Go to **Tools** → **Add Tool** → **REST API**
3. Upload `openapi.json` from this directory
4. Authentication: **None** (for demo) or **API Key** (for production)
5. Select the `analyzePolicy` tool
6. Save and test!

## API Reference

### POST /api/v1/analyze/sync

Analyze a federal policy question synchronously.

**Request:**
```json
{
  "query": "What are the cybersecurity requirements under EO 14028?",
  "context": "DoD agency implementing zero trust",
  "requestor": "IT Security Team"
}
```

**Response:**
```json
{
  "requestId": "uuid",
  "status": "completed",
  "query": "...",
  "result": "**Policy Analysis Summary**...",
  "processingTime": "3s",
  "analyst": "Federal Policy Analyst"
}
```

### GET /health

Health check endpoint.

## Topics Supported

- **Cybersecurity** - EO 14028, FISMA, Zero Trust, NIST frameworks
- **Privacy** - Privacy Act, PII handling, SORN requirements
- **Procurement** - FAR, competition, small business requirements
- **General** - Other federal policy questions

## Test It

```bash
curl -X POST https://analyst.turek.in/api/v1/analyze/sync \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the privacy requirements for collecting PII?"}'
```
