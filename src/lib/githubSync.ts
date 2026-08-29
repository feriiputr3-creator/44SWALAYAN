import { WorkspaceData } from '../types';

const GITHUB_OWNER = 'feriiputr3-creator';
const GITHUB_REPO = 'swalayan44';
const GITHUB_FILE_PATH = 'swalayan_data.json'; 

function utf8_to_b64(str: string) {
  return window.btoa(unescape(encodeURIComponent(str)));
}
function b64_to_utf8(str: string) {
  return decodeURIComponent(escape(window.atob(str)));
}

export async function fetchFromGithub(token: string): Promise<{ data: WorkspaceData | null; sha: string | null }> {
  if (!token) throw new Error("GitHub token not provided");
  
  const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    }
  });
  
  if (!res.ok) {
     if (res.status === 404) return { data: null, sha: null };
     throw new Error(`Failed to fetch from GitHub: ${res.status} ${res.statusText}`);
  }
  
  const data = await res.json();
  const content = b64_to_utf8(data.content);
  return { data: JSON.parse(content) as WorkspaceData, sha: data.sha };
}

export async function pushToGithub(token: string, data: WorkspaceData, sha: string | null): Promise<string> {
  if (!token) throw new Error("GitHub token not provided");
  
  const content = utf8_to_b64(JSON.stringify(data, null, 2));
  const body: any = {
    message: `Auto-sync from 44SWALAYAN app - ${new Date().toISOString()}`,
    content,
  };
  
  if (sha) {
    body.sha = sha;
  }
  
  const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  
  if (!res.ok) {
    throw new Error(`Failed to push to GitHub: ${res.status} ${res.statusText}`);
  }
  
  const resData = await res.json();
  return resData.content.sha;
}
