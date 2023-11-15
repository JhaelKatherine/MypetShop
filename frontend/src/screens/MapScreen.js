import axios from 'axios';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  LoadScript,
  GoogleMap,
  StandaloneSearchBox,
  Marker,
} from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';

// Ubicación predeterminada para el mapa
const defaultLocation = { lat: 45.516, lng: -73.56 };

// Bibliotecas requeridas para el mapa
const libs = ['places'];

export default function MapScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();

  // Estados para manejar la API de Google Maps y la ubicación
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [center, setCenter] = useState(defaultLocation);
  const [location, setLocation] = useState(center);

  // Referencias para el mapa, el cuadro de búsqueda y el marcador
  const mapRef = useRef(null);
  const placeRef = useRef(null);
  const markerRef = useRef(null);

  // Función para obtener la ubicación actual del usuario
  const getUserCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
    } else {
      navigator.geolocation.getCurrentPosition((position) => {
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  };

  // Efecto para obtener la clave de la API de Google Maps y la ubicación actual al cargar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Llamada para obtener la clave de la API de Google Maps
        const { data } = await axios('/api/keys/google', {
          headers: { Authorization: `BEARER ${userInfo.token}` },
        });
        setGoogleApiKey(data.key);
        getUserCurrentLocation();
      } catch (error) {
        // Manejo de errores en caso de fallo en la obtención de la clave de la API
        console.error('Error fetching Google API key:', error);
      }
    };

    fetchData(); // Llamada a la función para obtener la clave de la API y la ubicación actual
    ctxDispatch({
      type: 'SET_FULLBOX_ON',
    });
  }, [ctxDispatch, userInfo.token]);

  // Callbacks para eventos de carga y cambios en el mapa y el cuadro de búsqueda
  const onLoad = (map) => {
    mapRef.current = map;
  };

  const onIdle = () => {
    setLocation({
      lat: mapRef.current.center.lat(),
      lng: mapRef.current.center.lng(),
    });
  };

  const onLoadPlaces = (place) => {
    placeRef.current = place;
  };

  const onPlacesChanged = () => {
    const place = placeRef.current.getPlaces()[0].geometry.location;
    setCenter({ lat: place.lat(), lng: place.lng() });
    setLocation({ lat: place.lat(), lng: place.lng() });
  };

  const onMarkerLoad = (marker) => {
    markerRef.current = marker;
  };

  // Función para confirmar la selección de ubicación y guardarla en el estado global
  const onConfirm = () => {
    const places = placeRef.current.getPlaces() || [{}];
    ctxDispatch({
      type: 'SAVE_SHIPPING_ADDRESS_MAP_LOCATION',
      payload: {
        lat: location.lat,
        lng: location.lng,
        address: places[0].formatted_address,
        name: places[0].name,
        vicinity: places[0].vicinity,
        googleAddressId: places[0].id,
      },
    });
    toast.success('Location selected successfully.');
    navigate('/shipping');
  };

  return (
    <div className="full-box">
      <LoadScript libraries={libs} googleMapsApiKey={googleApiKey}>
        {/* Componente GoogleMap proporciona el mapa */}
        <GoogleMap
          id="smaple-map"
          mapContainerStyle={{ height: '100%', width: '100%' }}
          center={center}
          zoom={15}
          onLoad={onLoad}
          onIdle={onIdle}
        >
          {/* Componente StandaloneSearchBox proporciona el cuadro de búsqueda */}
          <StandaloneSearchBox
            onLoad={onLoadPlaces}
            onPlacesChanged={onPlacesChanged}
          >
            {/* Entrada para la búsqueda y botón para confirmar la ubicación */}
            <div className="map-input-box">
              <input type="text" placeholder="Enter your address"></input>
              <Button type="button" onClick={onConfirm}>
                Confirm
              </Button>
            </div>
          </StandaloneSearchBox>
          {/* Componente Marker muestra un marcador en la ubicación seleccionada */}
          <Marker position={location} onLoad={onMarkerLoad}></Marker>
        </GoogleMap>
      </LoadScript>
    </div>
  );
}