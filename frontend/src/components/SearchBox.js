import React, { useState } from 'react'; // Importa React y el hook useState
import Button from 'react-bootstrap/Button'; // Importa el componente Button de React Bootstrap
import Form from 'react-bootstrap/Form'; // Importa el componente Form de React Bootstrap
import InputGroup from 'react-bootstrap/InputGroup'; // Importa el componente InputGroup de React Bootstrap
import FormControl from 'react-bootstrap/FormControl'; // Importa el componente FormControl de React Bootstrap
import { useNavigate } from 'react-router-dom'; // Importa el hook useNavigate de React Router

export default function SearchBox() { // Define un componente funcional llamado SearchBox
  const navigate = useNavigate(); // Obtiene la función de navegación de React Router
  const [query, setQuery] = useState(''); // Inicializa el estado 'query' con el valor ''

  const submitHandler = (e) => { // Define una función llamada submitHandler que se ejecuta al enviar el formulario
    e.preventDefault(); // Previene el comportamiento por defecto del envío del formulario
    navigate(query ? `/search/?query=${query}` : '/search'); // Navega a la ruta '/search' con la query si está presente, de lo contrario, navega solo a '/search'
  };

  return (
    <Form className="d-flex me-auto" onSubmit={submitHandler}> {/* Crea un formulario que ejecuta submitHandler al enviar */}
      <InputGroup> {/* Crea un grupo de entrada */}
        <FormControl
          type="text"
          name="q"
          id="q"
          onChange={(e) => setQuery(e.target.value)} // Actualiza el estado 'query' con el valor del campo de entrada
          placeholder="search products..." // Texto de marcador de posición
          aria-label="Search Products" // Etiqueta para accesibilidad
          aria-describedby="button-search" // Describe la acción del botón para accesibilidad
        ></FormControl>
        <Button variant="outline-primary" type="submit" id="button-search"> {/* Botón de búsqueda */}
          <i className="fas fa-search"></i> {/* Ícono de búsqueda */}
        </Button>
      </InputGroup>
    </Form>
  );
}

