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

      <div className="flex flex-wrap gap-2">
          {(['office', 'party', 'date', 'gym'] as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="px-4 py-2 rounded-lg border text-sm font-medium capitalize transition-all hover:-translate-y-0.5"
              style={
                category === cat
                  ? { background: '#E87A6A', color: '#1A0800', borderColor: '#E87A6A' }
                  : { background: '#1C1C21', color: '#6E6E80', borderColor: '#2C2C34' }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        <div
          className="w-full space-y-3 p-5 rounded-xl border"
          style={{ background: '#1C1C21', borderColor: '#2C2C34' }}
        >
          <h2 className="text-sm font-medium" style={{ color: '#6E6E80' }}>
            {categoryTitles[category]}
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
              placeholder="Add new item..."
              className="flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none"
              style={{
                background: '#111114',
                color: '#F0EEF8',
                borderColor: '#2C2C34',
              }}
            />
            <button
              onClick={addItem}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ background: '#E87A6A', color: '#1A0800' }}
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


