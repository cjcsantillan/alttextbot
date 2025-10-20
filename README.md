# alttextbot

A CLI/library that generates concise alt text for images using a vision API.

## Install

```bash
npm install -g alttextbot
```

## Usage

```bash
alttextbot ./photo.png
alttextbot https://example.com/photo.jpg --json
alttextbot ./photo.png --max-length 120
```

## Configuration

Set your API key via environment variable:

```bash
export ALTTEXTBOT_API_KEY=your-key-here
```

Or create a `.alttextbotrc.json` file:

```json
{
  "apiKey": "your-key-here",
  "model": "default-vision-model",
  "maxLength": 150
}
```

## Development

```bash
npm run build
node --test
```

## License

MIT
