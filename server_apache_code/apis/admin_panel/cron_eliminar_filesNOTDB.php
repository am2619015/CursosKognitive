<?php

///// codigo que da todos los archivos de la base de datos de videos y materiales esto guardaria en un array 1
/*SELECT DISTINCT video_1 FROM talleres WHERE video_1 IS NOT NULL
UNION 
SELECT DISTINCT video_2 FROM talleres WHERE video_2 IS NOT NULL
UNION
SELECT DISTINCT video_3 FROM talleres WHERE video_3 IS NOT NULL
UNION
SELECT DISTINCT video_4 FROM talleres WHERE video_4 IS NOT NULL
UNION
SELECT DISTINCT material_taller FROM talleres WHERE material_taller IS NOT NULL*/


/// es decir que si reviso la carpeta content y materiales leo los archivos que posee los guardo en un array 2

/// luego recorro el array2 que podria ser el mas grande, y con una funcion de pertenece_a_db? voy mirando cada uno, los que no esten en la db se guardan en un array 3

/// se hacen algunos cambios al arrray3 para materias ya que incluyen https en url

//// ya lo que resta es correr en un loop el borrado de la lista de archivos que no son necesarios y estan degana

// este cron podria correrse cada 4 meses o algo por el estilo

///(EN Desarollo no importante por el momento)

?>