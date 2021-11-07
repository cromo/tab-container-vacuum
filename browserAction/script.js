document.getElementById('myHeading').style.color = 'red';

const inUseUI = document.getElementById("in-use");
const unusedUI = document.getElementById("unused");
const deleteButton = document.getElementById("delete-unused");

(async () => {
    const containerIdsInUse = await getActiveContainerIds();
    const containers = await browser.contextualIdentities.query({});

    // Some containers aren't in the full list of containers returned by
    // contextualIdentities.query({}), so we need to take those out of this
    // list.
    // I don't know why this happens yet, but I suspect it has something to do
    // with the default identity, which is not exposed in the main list.
    const containersInUse = Array.from(containerIdsInUse)
        .map((id) => containers.find(({ cookieStoreId }) => id === cookieStoreId))
        .filter((container) => container !== undefined);

    const unusedTempContainers = containers.filter(({ cookieStoreId, name }) => /tmp/.test(name) && !containerIdsInUse.has(cookieStoreId));

    inUseUI.innerHTML = toUnorderedList(containersInUse.map(pluck("name")));
    unusedUI.innerHTML = unusedTempContainers.length === 0 ? "None found" : toUnorderedList(unusedTempContainers.map(pluck("name")));

    deleteButton.addEventListener("click", () => deleteContainers(unusedTempContainers));
})();

async function getActiveContainerIds() {
    return new Set((await getAllTabs()).map(pluck("cookieStoreId")));
}

async function getAllTabs() {
    return await browser.tabs.query({});
}

function pluck(field) {
    return (container) => container[field];
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