docs
====

# Building the docs

STEP 1. Create a virtualenv:

```bash
virtualenv env
```

STEP 2. Activate the virtualenv:

```bash
. env/bin/activate
```

STEP 3. Install python dependencies:

```bash
pip install -r requirements.txt
```

Note: if you get an error saying `pip` is not available, you can install it with this command: `easy_install pip`.

STEP 4. Build the documentation from source:

```bash
make html
```

This will place the documentation in the`build` folder.

STEP 5. Start the script to auto-build the documentation:

```bash
bash watch.sh
```

This script watches for changes in the `source` folder, and will automatically re-build the documentation when changes are detected.

*Note:* The `watch.sh` script has only been tested on Linux (RHEL6).

STEP 6. Next, you should start a simple server to serve the content for development purposes. A little python script works well for this:

```bash
# Start an HTTP server from a directory, optionally specifying the port
function server() {
	local port="${1:-8000}"
	open "http://localhost:${port}/"
	# Set the default Content-Type to `text/plain` instead of `application/octet-stream`
	# And serve everything as UTF-8 (although not technically correct, this doesn’t break anything for binary files)
	python -c $'import SimpleHTTPServer;\nmap = SimpleHTTPServer.SimpleHTTPRequestHandler.extensions_map;\nmap[""] = "text/plain";\nfor key, value in map.items():\n\tmap[key] = value + ";charset=UTF-8";\nSimpleHTTPServer.test();' "$port"
}
```

Once you have defined this bash function (maybe in your `.bash_profile`), you can simply run:

```bash
server 9000
```

An http server will be started on port 9000, serving content from the directory where you executed the command.
