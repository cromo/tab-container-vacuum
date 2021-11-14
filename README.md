# Tab Container Vacuum

Some people's temporary containers aren't. This cleans up after them. Specifically, when using both Multi-Account Containers with syncing turned on and Temporary Containers configured to remove the containers it creates after some time, Multi-Account Containers will sync the temporary containers up, and after Temporary Containers removes them locally, Multi-Account Containers syncs them back down. This results in an accumulation of temporary containers. None of these extensions nor Firefox itself provide a way to delete more than one container at a time. Tab Container Vacuum fills this gap, helping you find and delete containers that match a pattern.

## Usage

After installation, click on the icon near the address bar to bring up the main panel. The search box supports regular expressions and defaults to a pattern that matches the default names that Temporary Containers uses. Searching will list all the matching containers and they can be deleted by pressing the corresponding button.

## Future work

- Add container color and icon to make detecting undesired matches easier
- Make searching by regex optional (i.e. add substring search)
- Allow filtering on container age by adding a backround script that keeps track of when containers are created

## License

Tab Container Vacuum is licensed under the BSD 2-Clause License. See the `LICENSE` file for details.