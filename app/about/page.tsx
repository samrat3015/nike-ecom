"use client"
import { useSelector, useDispatch } from "react-redux"
import { useEffect, useState } from "react"
import { increment, decrement, reset } from "@/store/slices/counterSlice"

export default function About() {
  const count = useSelector((state: any) => state.counter.value)
  const dispatch = useDispatch()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null // Wait for client hydration

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Counter: {count}</h1>
      <div className="space-x-2 mt-4">
        <button onClick={() => dispatch(increment())} className="px-3 py-1 bg-green-500 text-white rounded">Increment</button>
        <button onClick={() => dispatch(decrement())} className="px-3 py-1 bg-red-500 text-white rounded">Decrement</button>
        <button onClick={() => dispatch(reset())} className="px-3 py-1 bg-gray-500 text-white rounded">Reset</button>
      </div>
    </div>
  )
}
