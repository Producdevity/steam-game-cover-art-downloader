import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'

const app = express()
const port = 3000

app.use(cors())

app.get('/api/steam/apps', async (req, res) => {
  try {
    const response = await fetch(
      'https://api.steampowered.com/ISteamApps/GetAppList/v0002/?format=json',
    )
    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error('Error fetching Steam games:', error)
    res.status(500).json({ error: 'Failed to fetch Steam games' })
  }
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
