document.getElementById('myHeading').style.color = 'red';

(async () => {
    const containers = await browser.contextualIdentities.query({});
    const tempContainers = containers.filter(({name}) => /tmp/.test(name));
    // console.table(tempContainers);
    // const batches = tempContainers.reduce((prev, cur) => {
    //     const batch = prev[prev.length - 1];
    //     console.log(batch);
    //     if (batch.length < 10) {
    //         batch.push(cur);
    //         return prev;
    //     }
    //     return [...prev, [cur]];
    // }, [[]]);
    // console.log("final batches", batches)
    await Promise.all(tempContainers.map(({cookieStoreId}) => browser.contextualIdentities.remove(cookieStoreId)));
    // document.getElementById('myHeading').innerText = JSON.stringify(containers[0]);
})();