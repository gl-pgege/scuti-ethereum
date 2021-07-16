function generateGithubDownloadUrl (repoName, commitId) {
    const url = `https://api.github.com/repos/${process.env.GITHUB_ID}/${repoName}/tarball/${commitId}`;
    return url;
}

module.exports = {
    generateGithubDownloadUrl,
}