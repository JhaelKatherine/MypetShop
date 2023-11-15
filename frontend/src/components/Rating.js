function Rating(props) { // Define un componente funcional llamado Rating que recibe props como argumento
  const { rating, numReviews, caption } = props; // Extrae las propiedades rating, numReviews y caption de las props
  
  return ( // Retorna el contenido JSX del componente Rating
    <div className="rating"> {/* Crea un contenedor con la clase CSS 'rating' */}
      <span> {/* Crea un contenedor para cada estrella */}
        <i
          className={
            rating >= 1 // Dependiendo del valor de 'rating', se elige la clase para la estrella completa, media o vacía
              ? 'fas fa-star'
              : rating >= 0.5
              ? 'fas fa-star-half-alt'
              : 'far fa-star'
          }
        />
      </span>

      {/* Similar a las anteriores, se repite el proceso para las siguientes estrellas */}
      {/* Cada 'i' representa una estrella */}
      {/* La clase CSS 'fas fa-star' muestra una estrella completa, 'fas fa-star-half-alt' muestra media estrella y 'far fa-star' muestra una estrella vacía */}
      {/* El proceso se repite para cada estrella de 1 a 5 */}
      <span>
        <i
          className={
            rating >= 2
              ? 'fas fa-star'
              : rating >= 1.5
              ? 'fas fa-star-half-alt'
              : 'far fa-star'
          }
        />
      </span>
      <span>
        <i
          className={
            rating >= 3
              ? 'fas fa-star'
              : rating >= 2.5
              ? 'fas fa-star-half-alt'
              : 'far fa-star'
          }
        />
      </span>
      <span>
        <i
          className={
            rating >= 4
              ? 'fas fa-star'
              : rating >= 3.5
              ? 'fas fa-star-half-alt'
              : 'far fa-star'
          }
        />
      </span>
      <span>
        <i
          className={
            rating >= 5
              ? 'fas fa-star'
              : rating >= 4.5
              ? 'fas fa-star-half-alt'
              : 'far fa-star'
          }
        />
      </span>
      {/* La condición rating >= x determina si se debe mostrar una estrella completa, media o vacía */}
      {caption ? ( // Si hay una 'caption', se muestra; de lo contrario, muestra el número de reviews
        <span>{caption}</span>
      ) : (
        <span>{' ' + numReviews + ' reviews'}</span>
      )}
    </div>
  );
}

export default Rating; // Exporta el componente Rating por defecto para poder importarlo en otros archivos
