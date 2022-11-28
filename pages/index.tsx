import Head from 'next/head'
import { useEffect, useRef } from 'react'
import styles from '../styles/Home.module.css'

import Engin from "../engine"


export default function Home() {
  let engin:null|Engin
  const canvas = useRef<null|HTMLCanvasElement>(null)

  useEffect(()=>{
    if(!canvas.current)return
    const ctx = canvas.current.getContext("2d")

    if(!ctx) return

    engin = new Engin(ctx)
    engin.update(3300)

    return ()=>{
      if(engin)
        engin.cancelAnimation()
    }
    
  },[])

  return (
    <div className={styles.container}>
      <Head>
        <title>Canvas3D</title>
      </Head>

      <main className={styles.main}>
        <canvas ref={canvas} className={styles.canvas} width="550" height="550"/>
      </main>
    </div>
  )
}
