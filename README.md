# DevDock

DevDock is a VS Code extension for managing Docker-based development environments.

## Features

- Create and manage Docker containers for development.
- Simplified workflows for building, running, and debugging code in isolated environments.

## Installation

1. Download the extension from the VS Code Marketplace.
2. Install using the Extensions view in Visual Studio Code.

---

## Usages
### How to Use the VSCode Extension

1. Create an Empty Directory and Open It in VSCode
	- Start by creating a new empty directory.
	- Open the directory in VSCode.

2. Create a File with Your Desired Programming Language Extension
	- Example: main.py for Python.

3. Select the File in the Sidebar and Run devdock.run
	- Use the shortcut: **Cmd (Ctrl) + Shift + Alt + R**.

4. A **{language}.Dockerfile** is Automatically Generated
    - For Python, this would be python.Dockerfile:
        ```Dockerfile
        FROM python:3.12-alpine

        COPY . /app
        COPY requirements.txt /app

        WORKDIR /app

        RUN pip install --no-cache-dir -r requirements.txt

        EXPOSE 8080 80 
        EXPOSE 443

        VOLUME /data
        VOLUME /data /tmp  # The second "/data" will be ignored as it's duplicated
        VOLUME [ "/data" ] # This "/data" will also be ignored due to duplication
        VOLUME [ "/data", "/tmp2" ] # Only "/tmp2" is added as "/data" is redundant

        CMD ["python3", "main.py"]
        ```


5. Modify the Generated Files as Needed for Your Development Environment
	- When using the EXPOSE keyword, ports will be automatically mapped to random ports during execution:
        ```sh
        -p 8080:{random_port} -p 80:{random_port} -p 443:{random_port}
        ```

	- When using the VOLUME keyword, a python.Dockerfile.mount.json file is generated to define host-directory mappings.
	- Example python.Dockerfile.mount.json:
        ```json
        {
          "volumes": {
            "/host/path": "/container/path",
            "/data": "/app/data",
            "/tmp": "/app/tmp",
            "/tmp2": "/app/tmp2"
          }
        }
        ```
6. Check Container Logs with devdock.logs
	- Use this command to view the output inside the running container.

7. Open the Configuration File with devdock.openConfig
	- This command opens the configuration file, where you can:
	    - Edit the default Dockerfile template.
	    - Add support for additional programming languages.
	    - Even if the extension is uninstalled, this configuration file remains.
	    - When updating the extension, existing configurations take precedence and are merged with the latest version.
        - If you want to remove it, you must manually delete the configuration file from its directory.


### Shortcuts
|          Shortcut           |      Commnad       |            Function             |
| :-------------------------: | :----------------: | :-----------------------------: |
| cmd(ctrl) + shift + alt + r |    devdock.run     |          build and run          |
| cmd(ctrl) + shift + alt + c |   devdock.clean    | clean all images and containers |
| cmd(ctrl) + shift + alt + l |    devdock.logs    |         container logs          |
| cmd(ctrl) + shift + alt + o | devdock.openConfig |     Open your config file.      |


## Release Notes

### 0.0.x

- Initial release.
- Bug fix and update.
