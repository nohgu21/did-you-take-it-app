'use client'

import { useState, useEffect, useRef } from 'react'
import confetti from "canvas-confetti";
import { type ChecklistItem, officeItems, partyItems, dateItems, gymItems } from '../types/checklistData'
import Checklist from './components/Checklist';
import Header from './components/Header';
import useLocalStorage from '../hooks/useLocalStorage'
import useWeather from '@/hooks/useWeather';
import { Thermometer, ThermometerSun, ThermometerSnowflake, Sun } from 'lucide-react'

type Category = 'office' | 'party' | 'date' | 'gym'

export default function Page() {
  const [category, setCategory] = useLocalStorage<Category>('checklist-category', 'office' as Category)
  const [officeChecklist, setOfficeChecklist] = useLocalStorage<ChecklistItem[]>('office-checklist', officeItems)
  const [partyChecklist, setPartyChecklist] = useLocalStorage<ChecklistItem[]>('party-checklist', partyItems)
  const [dateChecklist, setDateChecklist] = useLocalStorage<ChecklistItem[]>('date-checklist', dateItems)
  const [gymChecklist, setGymChecklist] = useLocalStorage<ChecklistItem[]>('gym-checklist', gymItems)
  const [showModal, setShowModal] = useState(false)
  const [newItem, setNewItem] = useState('')
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)

  const categoryItems: Record<Category, ChecklistItem[]> = {
    office: officeChecklist,
    party: partyChecklist,
    date: dateChecklist,
    gym: gymChecklist
  }

  const categorySetting: Record<Category, (items: ChecklistItem[]) => void> = {
    office: setOfficeChecklist,
    party: setPartyChecklist,
    date: setDateChecklist,
    gym: setGymChecklist,
  }

  const items = categoryItems[category]


  const handleCheckBox = (id: number) => {
    const updatedItems = items.map((item: ChecklistItem) => item.id === id ? { ...item, isChecked: !item.isChecked } : item
    )
    categorySetting[category](updatedItems)
  };

  const addItem = () => {
    if (newItem.trim() === '') return
    const newChecklistItem: ChecklistItem = {
      id: Date.now(),
      name: newItem.trim(),
      isChecked: false
    }
    const updatedItems = [...items, newChecklistItem]
    categorySetting[category](updatedItems)
    setNewItem('')
  }

  const deleteItem = (id: number) => {
    const updatedItems = items.filter(item => item.id !== id)
    categorySetting[category](updatedItems)
  }

  const isComplete = useRef(false)

  useEffect(() => {
    const allChecked =
      items.length > 0 && items.every(item => item.isChecked)
    if (allChecked && !isComplete.current) {
      confetti({
        particleCount: 1000,
        spread: 100,
        origin: { y: 0.5 }
      });
      setShowModal(true)

    }
    isComplete.current = allChecked
  }, [items]);

  useEffect(() => {
    setShowModal(false)
  }, [category])

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
        },
        (error) => {
          console.error('Location error:', error)
          setUserLocation({ lat: 6.5244, lon: 3.3792 })
        })

    } else {
      setUserLocation({ lat: 6.5244, lon: 3.3792 })
    }
  }, [])

  const { weather, loading, error } = useWeather(
    userLocation?.lat,
    userLocation?.lon
  );

  const getThermometerIcon = (temp: number) => {
    if (temp <= 10) return <ThermometerSnowflake className="text-blue-400" />
    if (temp >= 30) return <ThermometerSun className="text-orange-600" />
    return <Thermometer className="text-red-400" />
  }

  const getWeatherSuggestion = (temp: number, condition: string) => {
    if (temp <= 10) return "Could use a heavy jacket and a muffler for this weather"
    if (condition.toLowerCase().includes('rain')) return "Don't forget to take an umbrella or a raincoat"
    if (temp >= 28) return "Take a waterbottle... stay hydrated"
    return "Looks like a nice day today!"
  }

  const categoryTitles: Record<Category, string> = {
    office: "Heading out to the office? Don't forget your...",
    party: "Heading out to have fun? Don't forget your...",
    date: "Heading out on a date? Don't forget your...",
    gym: "Heading out for a work out? Don't forget your..."
  }

  return (
    <>
      <Header />

      {loading && <div className="m-6 text-white">Loading weather...</div>}
      {error && <div className="m-6 text-red-400">Weather error: {error}</div>}
      {weather && (
        <div className="w-1/2 m-6 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
          <div className="flex gap-2">
            {getThermometerIcon(weather.temperature)}
          <p className="text-white text-lg">
            {Math.round(weather.temperature)}°C - {weather.condition}
          </p>
          </div>
          <p className="text-zinc-400 text-sm">{weather.description}</p>
          <p className="text-zinc-400 text-sm flex gap-2">
            <Sun/>
            <div className="mt-1">
             {getWeatherSuggestion(weather.temperature, weather.condition)}

            </div>
          </p>
        </div>
      )}



      <div className="m-6 flex gap-4">
        <button onClick={() => setCategory('office')}
          className={`px-4 py-2 border rounded-lg ${category === 'office' ? 'cursor-pointer hover:translate-y-[-2px] hover:shadow-md bg-zinc-800 text-neutral-100' : 'bg-zinc-800 text-gray-400'}`}
        >
          Office
        </button>

        <button onClick={() => setCategory('party')}
          className={`px-4 py-2 border rounded-lg ${category === 'party' ? 'cursor-pointer hover:translate-y-[-2px] hover:shadow-md bg-zinc-800 text-neutral-100' : 'bg-zinc-800 text-gray-400'}`}
        >
          Party
        </button>

        <button onClick={() => setCategory('date')}
          className={`px-4 py-2 border rounded-lg ${category === 'date' ? 'cursor-pointer hover:translate-y-[-2px] hover:shadow-md bg-zinc-800 text-neutral-100' : 'bg-zinc-800 text-gray-400'}`}
        >
          Date
        </button>

        <button onClick={() => setCategory('gym')}
          className={`px-4 py-2 border rounded-lg ${category === 'gym' ? 'cursor-pointer hover:translate-y-[-2px] hover:shadow-md bg-zinc-800 text-neutral-100' : 'bg-zinc-800 text-gray-400'}`}
        >
          Gym
        </button>
      </div>


      <div className="m-6 space-y-3 p-6 bg-zinc-900 w-1/2 border rounded-lg">
        <h2 className="text-neutral-100 text-md">
          {categoryTitles[category]}
        </h2>

        <div className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
            placeholder="Add new item..."
            className="flex-1 px-3 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:outline-none focus:border-yellow-900"
          />
          <button
            onClick={addItem}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-900"
          >
            Add
          </button>
        </div>

        {items.map((item) => (
          <Checklist
            key={item.id}
            name={item.name}
            isChecked={item.isChecked}
            onChange={() => handleCheckBox(item.id)}
            onDelete={() => deleteItem(item.id)}
          />
        ))}


      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-zinc-900 p-6 rounded-xl w-[90%] max-w-sm text-center space-y-3 shadow-xl">
            <h2 className="text-white text-lg font-semibold">You did it! 🎉</h2>
            <p className="text-zinc-300">Have a great day ahead!</p>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 px-4 py-2 rounded-lg bg-white text-black font-medium hover:bg-zinc-200 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </>
  )
}


