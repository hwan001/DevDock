# vsce package
DEVDOCK_VERSION="0.0.4"
git tag -a v$DEVDOCK_VERSION -m "Release version $DEVDOCK_VERSION"
git push origin v$DEVDOCK_VERSION
gh release create v$DEVDOCK_VERSION DevDock-h001-$DEVDOCK_VERSION.vsix --title "v$DEVDOCK_VERSION" --notes "Release v$DEVDOCK_VERSION"

