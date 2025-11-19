import os
import pandas as pd
from github import Github
import plotly.express as px

# Authentication (recommend using environment variable for security)
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
ORG = "nbnHackathon25"  # Change as needed

g = Github(GITHUB_TOKEN)
org = g.get_organization(ORG)
repos = org.get_repos()

metrics = []

for repo in repos:
    for contributor in repo.get_contributors():
        commits = repo.get_commits(author=contributor)
        metrics.append({
            "repo": repo.name,
            "user": contributor.login,
            "contributions": contributor.contributions,
            "commits": commits.totalCount
        })

df = pd.DataFrame(metrics)
fig = px.bar(df, x="user", y="commits", color="repo", barmode="group", title="Commits per User per Repo")
fig.show()

# Expand with PR, issue metrics, heatmaps, etc.