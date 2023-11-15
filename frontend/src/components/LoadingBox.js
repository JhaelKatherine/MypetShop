import Spinner from 'react-bootstrap/Spinner'; // Importa el componente Spinner de react-bootstrap

export default function LoadingBox() { // Define un componente funcional llamado LoadingBox
  return (
    <Spinner animation="border" role="status"> {/* Crea un Spinner con una animación de borde */}
      <span className="visually-hidden">Loading...</span> {/* Un mensaje de carga para usuarios con lectores de pantalla */}
    </Spinner>
  );
}
