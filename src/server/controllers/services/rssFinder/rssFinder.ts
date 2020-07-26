export function getRSSFeedUrl(url: string): string {
    let feedURL = "";
    if (url && url !== "") {
        const cleanUrl: string = url.replace("https://", "").replace("http://", "");
        const paths: string[] = cleanUrl.split("/");
        const urlWithoutHostName: string[] = url.split(paths[0]);
        const protocol: string = urlWithoutHostName[0];
        feedURL = protocol + paths[0];

        if (paths[0].includes("medium.com") && paths.length > 1) {
            feedURL += "/feed/" + paths[1];
        } else if (paths[0].includes("blogspot.com")) {
            feedURL += "/feeds/posts/default?alt=rss";
        } else if (url !== "") {
            feedURL += "/feed";
        }
    }
    return feedURL;
}
