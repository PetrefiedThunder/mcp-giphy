# mcp-giphy

Search GIFs, get trending content, random GIFs, and stickers via Giphy.

## Tools

| Tool | Description |
|------|-------------|
| `search` | Search for GIFs. |
| `trending` | Get trending GIFs. |
| `random` | Get a random GIF. |
| `search_stickers` | Search for stickers. |
| `translate` | Translate a phrase to a single GIF (Giphy's WeirdnessEngine). |

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `GIPHY_API_KEY` | Yes | Giphy API key (free at developers.giphy.com) |

## Installation

```bash
git clone https://github.com/PetrefiedThunder/mcp-giphy.git
cd mcp-giphy
npm install
npm run build
```

## Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "giphy": {
      "command": "node",
      "args": ["/path/to/mcp-giphy/dist/index.js"],
      "env": {
        "GIPHY_API_KEY": "your-giphy-api-key"
      }
    }
  }
}
```

## Usage with npx

```bash
npx mcp-giphy
```

## License

MIT
