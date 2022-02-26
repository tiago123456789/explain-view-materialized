import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import { useEffect, useState } from 'react';
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function App() {
  const [markers, setMarkers] = useState([]);
  const position = [51.505, -0.09]

  useEffect(() => {
    fetch("http://localhost:4000/reports/total-by-variant-country")
      .then(response => response.json())
      .then(response => {
        const data = response.data;
        const result = Object.keys(data).map(country => {
          return {
            latLong: [data[country].lat || 0, data[country].long || 0],
            variants: data[country]["variants"],
            title: country
          }
        })
        setMarkers(result)
      })

  }, []);
  return (
    <div>
      <MapContainer center={position} zoom={2} scrollWheelZoom={false} style={{ width: "100%", height: "600px"}}>
        <TileLayer 

          url={`https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoidGlhZ29yb3NhZGFjb3N0IiwiYSI6ImNrenc0aXJueDN6bTMyd254YTA1ZDZjZjIifQ.HZ0u98kwrI_DqDGZ398tiQ`}
        />
        {
          markers.map((item, index) => {
            return (
              <Marker key={index} position={item.latLong}>
                <Popup>
                  <p style={{ fontWeight: "bold", textAlign: "center" }}>{item.title}</p>
                  <ul style={{  listStyle: "none"}}>
                    { Object.keys(item.variants).map(variantName => {
                        return (<li><strong>{variantName}:</strong> {item.variants[variantName]}</li>)
                      })
                    }
                  </ul>
                </Popup>
              </Marker>
            )
          })
        }
      </MapContainer>
    </div>
  );
}

export default App;
