# Scripts

This directory contains utility scripts for development, testing, and deployment.

## Organization

- **Root scripts**: Main development scripts (`dogfood.sh`, `start.sh`, `start-ngrok.sh`)
- **test/**: Test scripts (`test_*.sh`)
- **Python scripts**: CLI utilities (`simple_cli.py`)

## Usage

### Development Scripts

```bash
# Start the development environment
./scripts/start.sh

# Start with ngrok tunnels
./scripts/start-ngrok.sh

# Dogfooding helper
./scripts/dogfood.sh [command]
```

### Test Scripts

```bash
# Run test suites
./scripts/test/test_*.sh
```

### Python Scripts

```bash
# Run Python utilities
python scripts/simple_cli.py
```

## Notes

- All scripts should be executable (`chmod +x`)
- Scripts use paths relative to the project root
- Check individual scripts for specific usage instructions

