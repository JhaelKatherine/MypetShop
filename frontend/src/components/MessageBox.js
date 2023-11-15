import Alert from 'react-bootstrap/Alert'; // Importa el componente Alert de react-bootstrap

export default function MessageBox(props) { // Define un componente funcional llamado MessageBox
  return <Alert variant={props.variant || 'info'}>{props.children}</Alert>; // Devuelve un componente Alert
}
