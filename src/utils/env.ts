// we will use .env file to these things later

const env = () => {
  return {
    STEAM_API_URL: {
      getAppList: 'https://api.steampowered.com/ISteamApps/GetAppList/v0002/?format=json',
    },
  }
}

export default env
