const crypto = require("crypto");
const { 
    createGithubRepoFromTemplate, 
    generateGithubCreateRepoFromTemplateUrl, 
    generateAddCollaboratorToRepoUrl,
    addCollaboratorToRepo 
} = require("../../utils/github");

async function optIntoContractController(req, res){

    const {
        repoName,
        developerGithubName,
    } = req.body;

    const id = crypto.randomBytes(4).toString("hex");

    const repoName_PLACEHOLDER = `test-repo-${id}`

    /*
        TODO: Generate the templateREpo (second argument) based on data from request (contest specific template)

        - Remember to ensure to set the repo as a template repository under the settings of the template repo
    */
    const createRepoUrl = generateGithubCreateRepoFromTemplateUrl("pgege", "ether-contest-234");
    const addCollaboratorUrl = generateAddCollaboratorToRepoUrl(repoName_PLACEHOLDER, developerGithubName);

    console.log(createRepoUrl);
    console.log(addCollaboratorUrl);

    try {
        const repoData = await createGithubRepoFromTemplate(createRepoUrl, repoName_PLACEHOLDER);
        const addCollaboratorStatus = await addCollaboratorToRepo(addCollaboratorUrl);

        // TODO: Check if github Repo creation was successful before responding with the repo.owner.html_url
        res.status(200).json({
            "repositoryUrl": (repoData.owner.html_url)
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }


}

module.exports = {
    optIntoContractController
}