import React, { useEffect, useState } from 'react';
import { GoogleMap, InfoBox, Marker, useJsApiLoader } from '@react-google-maps/api';

import mapImage from '../assets/png/gentle_man.png'
import keys from '../config/keys';
 
function animateMarkerTo(oldMarker, newPosition) {
    
    let animationHandler;
 
    const options = {
        duration: 2000,
        easing(x, t, b, c, d) {
            const temp = -c * (t /= d) * (t - 2) + b;
            return temp;
        }
    }; 
 
    const startPositionLat = oldMarker.getPosition().lat();
    const startPositionLng = oldMarker.getPosition().lng();
    const newPositionLat = newPosition?.lat();
    let newPositionLng = newPosition?.lng();
 
    if (Math.abs(newPositionLng - startPositionLng) > 180) {
        if (newPositionLng > startPositionLng) {
            newPositionLng -= 360;
        } else {
            newPositionLng += 360;
        }
    }
 
    const animateStep = function (markerToAnimate, startTime) {
        const ellapsedTime = new Date().getTime() - startTime;
        const durationRatio = ellapsedTime / options.duration;
        const easingDurationRatio = options.easing(
            durationRatio,
            ellapsedTime,
            0,
            1,
            options.duration
        );
 
        if (durationRatio < 1) {
            markerToAnimate.setPosition({
                lat: startPositionLat + (newPositionLat - startPositionLat) * easingDurationRatio,
                lng: startPositionLng + (newPositionLng - startPositionLng) * easingDurationRatio
            });
 
            if (window.requestAnimationFrame) {
                animationHandler = window.requestAnimationFrame(function () {
                    animateStep(markerToAnimate, startTime);
                });
            } else {
                animationHandler = setTimeout(function () {
                    animateStep(markerToAnimate, startTime);
                }, 17);
            }
        } else {
            markerToAnimate?.setPosition(newPosition);
        }
    };
 
    if (window.cancelAnimationFrame) {
        window.cancelAnimationFrame(animationHandler);
    } else {
        clearTimeout(animationHandler);
    }
 
    animateStep(oldMarker, new Date().getTime());
}
 
function LiveMap({ data, navFromMenu }) {
 
    const mapRef = React.useRef(null);
    const markerRefs = React.useRef(Array(data.length).fill(null))
 
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: keys.google_map_api_key
    });
     
    const generateIconState = (dataLength) => {
        const initialIcon = {
            url: `data:image/svg+xml;utf8, ${encodeURIComponent
            (`<svg xmlns="http://www.w3.org/2000/svg" transform="rotate(0)" viewBox="-9 -7 50 50" height="40">
                <g id="Arrow_GPS" data-name="Arrow GPS">
                    <circle cx="16" cy="18" r="25" fill="blue" />
                    <path
                        d="M26.9336,28.6411l-10-26a1,1,0,0,0-1.8672,0l-10,26A1,1,0,0,0,6.6,29.8L16,22.75l9.4,7.05a1,1,0,0,0,1.5332-1.1587Z"
                        style="fill:white"
                    />
                </g>
            </svg>`
            )}`
        };
        return Array(dataLength).fill(initialIcon);
    };
    
    const [ icon, setIcon ] = useState(generateIconState(data.length))
    const [ map, setMap ] = useState(null)
    const [ boundAnimFlag, setBoundAnimFlag ] = useState(true);
    const [ initialMarkerPosition, setInitialMarkerPosition ] = useState([{ lat: 0, lng: 0 }])
    const [ initialMapBound, setInitialMapBound ] = useState({ lat: 0, lng: 0 })
    const [ moveableMarker, setMoveableMarker ] = useState()
    const [ displayMarkerLabel, setDisplayMarkerLabel ] = useState(null)
         
    const onLoad = React.useCallback((initialmap) => {
        setMap(initialmap)
        const array = []
        data?.map((_, index) => array.push({ 
            lat: data[index]?.originLatitude, 
            lng: data[index]?.originLongitude 
        }));
        setInitialMarkerPosition(array)
        setInitialMapBound({ lat: data[0]?.originLatitude, lng: data[0]?.originLongitude })
    }, []);
 
 
    const onUnmount = React.useCallback(function callback() {
        mapRef.current = null;
    }, []);

    useEffect(() => {
        if(data && initialMarkerPosition[0]?.lat !== 0 && initialMarkerPosition[0]?.lng !== 0 && map){
            if(initialMarkerPosition.length !== data?.length){
                const array = []
                data?.map((_, index) => array.push({ 
                    lat: data[index]?.originLatitude, 
                    lng: data[index]?.originLongitude 
                }));
                setInitialMarkerPosition(array)
            }
        }            
    }, [data])

    let count = 0
    useEffect(() => {
        if (map) {
             const bounds = data?.length > 1 
             ? new window.google.maps.LatLngBounds()
             : new window.google.maps.LatLngBounds({
                lat: data[0]?.originLatitude,
                lng: data[0]?.originLongitude
            });

            data?.length > 1 && data?.map((_, index) => {
                const marker = new window.google.maps.Marker({ 
                    position: { 
                        lat: data[index]?.originLatitude, 
                        lng: data[index]?.originLongitude 
                    }
                })
                bounds.extend(marker.position);
            });

            map.fitBounds(bounds);
            data?.length === 1 && map.setZoom(15);
            mapRef.current = map;
 
            if(count === 0) {
                map.addListener('idle', () => {
                    if(count === 0 ){  
                        count = 1          
                        data?.length === 1 && map.setZoom(15);
                        mapRef.current = map;  
                    }                
                });        
            }
        }
        
    }, [map]);

    useEffect(() => {
        data?.forEach((_, index) => {

            if(isLoaded 
                && data[index]?.originLatitude 
                && data[index]?.originLongitude 
                && (data?.length === 1 || moveableMarker === index)){

                const bounds = map.getBounds()    
                const markerPosition = new window.google.maps.LatLng(
                    data[index]?.originLatitude, 
                    data[index]?.originLongitude
                )             
                if(!bounds?.contains(markerPosition)){
                    if(data?.length === 1){
                        const newBounds = new window.google.maps.LatLngBounds({
                            lat: data[0]?.originLatitude,
                            lng: data[0]?.originLongitude
                        }); 
                        if(boundAnimFlag) {
                            map.fitBounds(newBounds);
                            map.setZoom(15.00000000000001)
                            mapRef.current = map;
                            setBoundAnimFlag(!boundAnimFlag)
                        } else {
                            map.fitBounds(newBounds);
                            map.setZoom(15)
                            mapRef.current = map;
                            setBoundAnimFlag(!boundAnimFlag)
                        }
                    } else {                     
                        if(markerPosition){
                            bounds.extend(markerPosition);
                        }
                        map.fitBounds(bounds);
                        mapRef.current = map;
                    }
                }            
   
                if (markerRefs?.current[index]?.marker) {
                    calculateBearing(
                        {
                            lat: markerRefs?.current[index]?.marker?.getPosition()?.lat(),
                            lng: markerRefs?.current[index]?.marker?.getPosition()?.lng()
                        },
                        {
                            lat: data[index]?.originLatitude,
                            lng: data[index]?.originLongitude
                        },
                        index
                    ) 
                    const newcoords = new window.google.maps.LatLng(
                        parseFloat(data[index]?.originLatitude.toString()), 
                        parseFloat(data[index]?.originLongitude.toString())
                    )
                    animateMarkerTo(
                        markerRefs.current[index].marker, 
                        newcoords
                    );
                }    
            }
        });
 
    }, [data]);
 
    const calculateBearing = (prevPosition, currentPosition, index) => {

        if (!prevPosition || !currentPosition || !isLoaded) {
            return 0;
        }
   
        const lat1 = prevPosition.lat;
        const lng1 = prevPosition.lng;
        const lat2 = currentPosition.lat;
        const lng2 = currentPosition.lng;
   
        const y = Math.sin(lng2 - lng1) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);
   
        const bearing = Math.atan2(y, x);
        const bearingInDegrees = ((bearing * 180) / Math.PI) % 360;
       
        if( bearingInDegrees > 314 
            || bearingInDegrees < 46 
            || ( bearingInDegrees > 134 && bearingInDegrees < 226 ) ){
            setIcon(prevIcon => {
                const newArray = [...prevIcon];
                newArray[index] = {
                    url: `data:image/svg+xml;utf8, ${encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" transform="rotate(${(bearingInDegrees)})" viewBox="-9 -7 50 50">
                        <g id="Arrow_GPS" data-name="Arrow GPS">
                            <circle cx="16" cy="18" r="25" fill="blue" />
                            <path
                                d="M26.9336,28.6411l-10-26a1,1,0,0,0-1.8672,0l-10,26A1,1,0,0,0,6.6,29.8L16,22.75l9.4,7.05a1,1,0,0,0,1.5332-1.1587Z"
                                style="fill:white"
                            />
                        </g>
                    </svg>
                    `)}`,
                    scaledSize: new window.google.maps.Size(35, 35),
                    anchor: new window.google.maps.Point(10, 10)
                }
                return newArray;
            });
        }
        else if ( bearingInDegrees > 45 && bearingInDegrees < 135 ){
            setIcon(prevIcon => {
                const newArray = [...prevIcon];
                newArray[index] = {
                    url: `data:image/svg+xml;utf8, ${encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" transform="rotate(${(bearingInDegrees)})" viewBox="-9 -7 50 50">
                        <g id="Arrow_GPS" data-name="Arrow GPS">
                            <circle cx="16" cy="18" r="25" fill="blue" />
                            <path
                                d="M26.9336,28.6411l-10-26a1,1,0,0,0-1.8672,0l-10,26A1,1,0,0,0,6.6,29.8L16,22.75l9.4,7.05a1,1,0,0,0,1.5332-1.1587Z"
                                style="fill:white"
                            />
                        </g>
                    </svg>
                    `)}`,
                    scaledSize: new window.google.maps.Size(35, 35),
                    anchor: new window.google.maps.Point(0, 15)
                }
                return newArray;
            });
        }
        else{
            setIcon(prevIcon => {
                const newArray = [...prevIcon];
                newArray[index] = {
                    url: `data:image/svg+xml;utf8, ${encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" transform="rotate(${(bearingInDegrees)})" viewBox="-9 -7 50 50">
                        <g id="Arrow_GPS" data-name="Arrow GPS">
                            <circle cx="16" cy="18" r="25" fill="blue" />
                            <path
                                d="M26.9336,28.6411l-10-26a1,1,0,0,0-1.8672,0l-10,26A1,1,0,0,0,6.6,29.8L16,22.75l9.4,7.05a1,1,0,0,0,1.5332-1.1587Z"
                                style="fill:white"
                            />
                        </g>
                    </svg>`
                    )}`,
                    scaledSize: new window.google.maps.Size(35, 35),
                    anchor: new window.google.maps.Point(0, 0)
                }
                return newArray;
            });       
        };

        return null
    }
 
    return isLoaded ? (
        <div>
            <GoogleMap
                mapContainerStyle={{ width: "100%", height: navFromMenu ? "83vh" : '80vh' }}
                ref={mapRef}
                zoom={16}
                onLoad={onLoad}
                onUnmount={onUnmount}
                center={initialMapBound}                
            >
                {initialMarkerPosition && initialMarkerPosition?.map((_, index) => {
                    return (
                        <Marker
                            ref={ref => { markerRefs.current[index] = ref }}
                            position={initialMarkerPosition[index]}
                            icon={data?.length === 1 && false ? icon[index] :
                            {
                                url: mapImage, 
                                scaledSize: new window.google.maps.Size(60, 60), 
                                origin: new window.google.maps.Point(0, 0),
                                anchor: new window.google.maps.Point(40, 40),
                            }}
                            onClick={() => { setMoveableMarker(index) }}
                            onMouseOver={() => { setDisplayMarkerLabel(index) }}
                            onMouseOut={() => { setDisplayMarkerLabel(null) }}
                        >
                            {displayMarkerLabel === index && data[index]?.adjusterName && (
                                <InfoBox
                                    position={initialMarkerPosition[index]}
                                    options={{
                                        closeBoxURL: '',
                                        enableEventPropagation: true,
                                    }}
                                >
                                    <div style={{
                                        color: 'black',
                                        backgroundColor: 'white',
                                        padding: '15px 20px',
                                        borderRadius: 4,
                                        borderColor: '#A9A9A9',
                                        fontWeight: 700,
                                        width: 'auto',
                                        whiteSpace: 'nowrap',
                                        borderWidth: 1,
                                        borderStyle: 'solid',
                                    }}>
                                        {data[index]?.adjusterName}
                                    </div>
                                </InfoBox>
                            )}
                        </Marker>
                    );
                })}
            </GoogleMap>
        </div>
    ) : (
        <p>Loading......</p>
    );
}
 
export default React.memo(LiveMap);