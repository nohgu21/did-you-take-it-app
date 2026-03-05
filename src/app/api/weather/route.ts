import { NextResponse } from 'next/server'

interface WeatherAPIResponse {
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  wind: {
    speed: number;
  };
}

export async function GET(request: Request) {
    const { searchParams } = new URL (request.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')

    if (!lat || !lon) {
        return NextResponse.json (
            {error: 'Latitude and Longitude are required'},
            {status: 400}
        )
    }

    const apiKey = process.env.OPENWEATHERMAP_API_KEY

    if (!apiKey) {
        return NextResponse.json (
            {error: 'API Key not configured'},
            {status: 500}
        )
    }

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        )

        if (!response.ok) {
            throw new Error ('Weather API request failed')
        }

        const data: WeatherAPIResponse = await response.json()

        return NextResponse.json({
            temperature: data.main.temp,
            condition: data.weather[0].main,
            description: data.weather[0].description,
            humidity: data.main.humidity,
            windSpeed:data.wind.speed,
        })
    } catch (error) {
        console.log('Weather API error:', error)
        return NextResponse.json(
            {error: 'failed to fetch weather data'},
            {status: 500}
        )
    }
}