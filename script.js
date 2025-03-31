// Global state for the current mode: "vertical" or "horizontal"
let currentMode = "vertical";

function toggleMode() {
  const toggle = document.getElementById("toggleMode");
  currentMode = toggle.checked ? "horizontal" : "vertical";
  document.getElementById("toggleLabel").innerText = toggle.checked
    ? "Horizontal"
    : "Vertical";
  // Update the image titles (optional)
  if (currentMode === "vertical") {
    document.getElementById("img1Title").innerText = "Game Cover";
    document.getElementById("img2Title").innerText = "Game Page Background";
    document.getElementById("img3Title").innerText = "Game Logo";
  } else {
    document.getElementById("img1Title").innerText = "Capsule 616x353";
    document.getElementById("img2Title").innerText = "Capsule 231x87";
    document.getElementById("img3Title").innerText = "Header";
  }
  updateImages();
}

function updateImages() {
  // const appId = document.getElementById("appIdInput").value.trim();
  const appId = document.querySelector("#appIdInput").value.trim();

  console.log("update Images for ", appId);
  if (!appId) {
    alert("Please enter a valid Steam APP_ID.");
    return;
  }

  let img1Url, img2Url, img3Url;
  if (currentMode === "vertical") {
    img1Url = `https://steamcdn-a.akamaihd.net/steam/apps/${appId}/library_600x900_2x.jpg`;
    img2Url = `https://steamcdn-a.akamaihd.net/steam/apps/${appId}/library_hero.jpg`;
    img3Url = `https://steamcdn-a.akamaihd.net/steam/apps/${appId}/logo.png`;
  } else {
    img1Url = `https://steamcdn-a.akamaihd.net/steam/apps/${appId}/capsule_616x353.jpg`;
    img2Url = `https://steamcdn-a.akamaihd.net/steam/apps/${appId}/capsule_231x87.jpg`;
    img3Url = `https://steamcdn-a.akamaihd.net/steam/apps/${appId}/header.jpg`;
  }

  // Update image sources.
  document.getElementById("img1").src = img1Url;
  document.getElementById("img2").src = img2Url;
  document.getElementById("img3").src = img3Url;

  // Update individual download links.
  document.getElementById("img1Download").href = img1Url;
  document.getElementById("img2Download").href = img2Url;
  document.getElementById("img3Download").href = img3Url;
}

async function downloadZip() {
  const appId = document.getElementById("appIdInput").value.trim();
  if (!appId) {
    alert("Please enter a valid Steam APP_ID.");
    return;
  }

  let urls = [];
  let fileNames = [];
  if (currentMode === "vertical") {
    urls = [
      `https://steamcdn-a.akamaihd.net/steam/apps/${appId}/library_600x900_2x.jpg`,
      `https://steamcdn-a.akamaihd.net/steam/apps/${appId}/library_hero.jpg`,
      `https://steamcdn-a.akamaihd.net/steam/apps/${appId}/logo.png`,
    ];
    fileNames = ["game_cover.jpg", "game_page_background.jpg", "game_logo.png"];
  } else {
    urls = [
      `https://steamcdn-a.akamaihd.net/steam/apps/${appId}/capsule_616x353.jpg`,
      `https://steamcdn-a.akamaihd.net/steam/apps/${appId}/capsule_231x87.jpg`,
      `https://steamcdn-a.akamaihd.net/steam/apps/${appId}/header.jpg`,
    ];
    fileNames = ["capsule_616x353.jpg", "capsule_231x87.jpg", "header.jpg"];
  }

  const zip = new JSZip();
  const folder = zip.folder(appId);

  // Fetch each image and add it to the zip folder.
  for (let i = 0; i < urls.length; i++) {
    try {
      const response = await fetch(urls[i]);
      if (!response.ok) throw new Error(`Failed to fetch ${urls[i]}`);
      const blob = await response.blob();
      folder.file(fileNames[i], blob);
    } catch (error) {
      alert("Error fetching image: " + error);
      return;
    }
  }

  // Generate the zip file and trigger download.
  zip.generateAsync({ type: "blob" }).then(function (content) {
    saveAs(content, `${appId}.zip`);
  });
}

const zipButton = document.querySelector(".zip-button");
const showArtButton = document.querySelector(".show-art-button");
const toggleModeSwitch = document.querySelector("#toggleMode");

toggleModeSwitch.addEventListener("change", () => toggleMode());
zipButton.addEventListener("click", () => downloadZip());

showArtButton.addEventListener("change", () => updateImages());
