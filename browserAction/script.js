document.getElementById('myHeading').style.color = 'red';

const inUseUI = document.getElementById("in-use");
const unusedUI = document.getElementById("unused");
const deleteButton = document.getElementById("delete-unused");

(async () => {
    const containerIdsInUse = await getActiveContainerIds();
    const containers = await getAllContainers();

    // Some containers aren't in the full list of containers returned by
    // contextualIdentities.query({}), so we need to take those out of this
    // list.
    // I don't know why this happens yet, but I suspect it has something to do
    // with the default identity, which is not exposed in the main list.
    const containersInUse = Array.from(containerIdsInUse)
        .map(lookupContainerByCookieStoreId(containers))
        .filter(isDefined);

    const unusedTempContainers = containers
        .filter(chain(pluck("name"), matchesRegex(/tmp/)))
        .filter(({ cookieStoreId }) => !containerIdsInUse.has(cookieStoreId));

    inUseUI.innerHTML = toUnorderedList(containersInUse.map(pluck("name")));
    unusedUI.innerHTML = unusedTempContainers.length === 0 ? "None found" : toUnorderedList(unusedTempContainers.map(pluck("name")));

    deleteButton.addEventListener("click", () => deleteContainers(unusedTempContainers));
})();

function matchesRegex(regex) {
    return (string) => regex.test(string);
}

function chain(f, g) {
    return (x) => g(f(x));
}

async function getActiveContainerIds() {
    return new Set((await getAllTabs()).map(pluck("cookieStoreId")));
}

async function getAllContainers() {
    return browser.contextualIdentities.query({});
}

function lookupContainerByCookieStoreId(containers) {
    const containersById = new Map(containers.map((container) => [container.cookieStoreId, container]));
    return (id) => containersById.get(id);
}

async function getAllTabs() {
    return await browser.tabs.query({});
}

function isDefined(value) {
    return value !== undefined;
}

function pluck(field) {
    return (record) => record[field];
}

async function deleteContainers(containers) {
    return await Promise.all(containers.map(deleteContainer));
}

async function deleteContainer({ cookieStoreId }) {
    return browser.contextualIdentities.remove(cookieStoreId);
}

function toUnorderedList(array) {
    return ["<ul>", ...array.map((value) => `<li>${value}</li>`), "</ul>"].join("");
}