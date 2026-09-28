"use client";

import { useEffect, useState } from "react";

interface CounterProps {
  end: number;
  duration?: number;
  suffix?: string;
}

function useCounter({ end, duration = 2000, suffix = "" }: CounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 30);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 30);

    return () => clearInterval(timer);
  }, [end, duration, suffix]);

  return count;
}

interface StatsCounterProps {
  studentsTrained?: number;
  companies?: number;
  rating?: number;
}

export default function StatsCounter({
  studentsTrained = 10000,
  companies = 500,
  rating = 4.9,
}: StatsCounterProps) {
  const studentCount = useCounter({ end: studentsTrained });
  const companyCount = useCounter({ end: companies });
  const ratingCount = useCounter({ end: Math.floor(rating * 10) }) / 10;

  return (
    <section className="py-20 bg-navy-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Our Impact</h2>
          <p className="text-teal-300">Numbers that speak for themselves</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
            <div className="text-4xl font-bold text-teal-400 mb-2">
              {studentCount.toLocaleString()}
              <span className="text-sm text-white">+</span>
            </div>
            <p className="text-white">Students Trained</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
            <div className="text-4xl font-bold text-teal-400 mb-2">
              {companyCount.toLocaleString()}
              <span className="text-sm text-white">+</span>
            </div>
            <p className="text-white">Companies Served</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
            <div className="text-4xl font-bold text-teal-400 mb-2">
              {ratingCount.toFixed(1)}
              <span className="text-sm text-white">★</span>
            </div>
            <p className="text-white">Average Rating</p>
          </div>
        </div>
      </div>
    </section>
  );
}