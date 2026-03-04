import useSWR from 'swr'

interface WeatherData {
    temperature: number;
    condition: string;
    description: string;
    humidity: number;
    windSpeed: number;
}

const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) throw new Error ('failed to fetch weather')
        return res.json()
})

export default function useWeather (latitude?: number, longitude?: number) {
    const url = latitude && longitude
    ? `/api/weather?lat=${latitude}&lon=${longitude}`
    : null

    const { data, error, isLoading} = useSWR<WeatherData>(url, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 60000,
})


    return {
    weather: data,
    loading: isLoading,
    error: error?.message || null
}

}

