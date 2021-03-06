const patternField = document.getElementById("pattern");
const searchButton = document.getElementById("search");
const deleteButton = document.getElementById("delete-unused");
const unusedUI = document.getElementById("unused");

(async function load() {
    const { pattern } = await browser.storage.local.get("pattern");
    if (pattern) {
        patternField.value = pattern;
    }
    updateContainerLists();
})();
searchButton.onclick = () => updateContainerLists();
patternField.addEventListener("input", () =>
    browser.storage.local.set({ pattern: patternField.value }));

async function updateContainerLists() {
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

    const pattern = patternField.value === "" ? /^tmp\d+$/ : new RegExp(patternField.value);
    const unusedTempContainers = containers
        .filter(chain(pluck("name"), matchesRegex(pattern)))
        .filter(({ cookieStoreId }) => !containerIdsInUse.has(cookieStoreId));

    unusedUI.innerHTML = unusedTempContainers.length === 0 ?
        "None found" :
        unusedTempContainers.map(({ name }) => `<span>${name}</span>`).join("");
        // toUnorderedList(unusedTempContainers.map(pluck("name")));

    deleteButton.onclick = async () => {
        await deleteContainers(unusedTempContainers);
        updateContainerLists();
    };
};

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