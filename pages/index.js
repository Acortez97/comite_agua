import { useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { useRouter } from 'next/router';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartDataLabels
);

export default function Home() {
  const router = useRouter();
  const [salidas, setSalidas] = React.useState([]);
  const [pagos, setPagos] = React.useState([]);
  const [avol, setAvol] = React.useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      router.push('/login');
    }
  }, []);

  React.useEffect(() => {
    fetch('/api/Selectgeneric/Select_Gen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        select: `SUM(monto) AS total_salidas`,
        table: `salidas`,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setSalidas(data);
      });

    fetch('/api/Selectgeneric/Select_Gen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        select: `SUM(monto_pago) AS total_pagos`,
        table: `pagos`,
      }),
    })
      .then((res2) => res2.json())
      .then((data2) => {
        if (!data2.error) setPagos(data2);
      });

    fetch('/api/Selectgeneric/Select_Gen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        select: `SUM(monto) AS total_avol`,
        table: `aportacion_voluntaria`,
      }),
    })
      .then((res3) => res3.json())
      .then((data3) => {
        if (!data3.error) setAvol(data3);
      })
      .catch((err) => console.error('Error al obtener aportaciones:', err));
  }, []);

  const totalSalidas = Number(salidas[0]?.total_salidas || 0);
  const totalPagos = Number(pagos[0]?.total_pagos || 0);
  const totalAvol = Number(avol[0]?.total_avol || 0);
  const totalSobrante = totalPagos + totalAvol - totalSalidas;

  const data = {
    labels: ['Pagos Anualidad', 'Aportaciones Voluntarias', 'Gastos (Salidas)', 'Sobrante'],
    datasets: [
      {
        label: 'Totales en pesos (MXN)',
        data: [totalPagos, totalAvol, totalSalidas, totalSobrante],
        backgroundColor: [
          'rgba(0, 150, 136, 0.7)',
          'rgba(33, 150, 243, 0.7)',
          'rgba(244, 67, 54, 0.7)',
          'rgba(76, 175, 80, 0.7)',
        ],
        borderColor: [
          'rgba(0, 150, 136, 1)',
          'rgba(33, 150, 243, 1)',
          'rgba(244, 67, 54, 1)',
          'rgba(76, 175, 80, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Resumen Financiero del Comité de Agua',
      },
      datalabels: {
        anchor: 'end',
        align: 'top',
        color: '#000',
        font: { weight: 'bold' },
        formatter: (value) => `$${value.toLocaleString('es-MX')}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value.toLocaleString('es-MX')}`,
        },
      },
    },
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        padding: '1px',
        backgroundColor: '#e0f7fa',
        color: '#00796b',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontSize: '3.1rem',
          fontWeight: '700',
          marginBottom: '50px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
        }}
      >
        Bienvenido al Portal de Administración del Comité de Agua
      </h1>

      {/* Contenedor flex para imagen y gráfica */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '50px',
          flexWrap: 'wrap', // para que en pantallas pequeñas se acomode
          width: '90%',
        }}
      >
        {/* Imagen */}
        <img
          src="/logoagua.ico"
          alt="Icono Comité del Agua"
          style={{
            width: '220px',
            height: 'auto',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 121, 107, 0.4)',
          }}
        />

        {/* Gráfica */}
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <Bar data={data} options={options} />
        </div>
      </div>
    </div>
  );
}
