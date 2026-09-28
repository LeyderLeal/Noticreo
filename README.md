# NotiCreo

Plataforma web de noticias desarrollada para el módulo **Desarrollo de Front-end** del Politécnico Grancolombiano.

construido con HTML, CSS y JavaScript.

## Funcionalidades

- Seis páginas: Inicio, Noticias, Detalle, Favoritos, Publicar y Contacto.
- Renderizado dinámico de las noticias desde el archivo local `data/noticias.json`.
- Listado con filtro por sección, búsqueda, orden y paginación.
- Vista de detalle con información completa, imagen y botones de interacción.
- Favoritos guardados en `localStorage`, con lista personalizada y contador en la cabecera.
- Formulario de contacto con validaciones y mensaje de confirmación.
- Formulario de publicación con validaciones y vista previa de la tarjeta.

## Cómo ejecutarlo

Las noticias se cargan con `fetch` y el código está organizado en módulos de JavaScript. Por seguridad, los navegadores bloquean ambas cosas cuando un archivo se abre con doble clic (protocolo `file://`), así que el proyecto debe abrirse desde un servidor local.

**Opción 1: Python** (incluido en Linux y macOS)

```bash
cd Noticreo
python3 -m http.server 8000
```

Luego abrir <http://localhost:8000> en el navegador.

**Opción 2: Visual Studio Code**

Instalar la extensión *Live Server*, hacer clic derecho sobre `index.html` y elegir *Open with Live Server*.

## Estructura del proyecto

```
Noticreo/
├── index.html              Página de inicio
├── noticias.html           Listado de noticias
├── detalle.html            Detalle de una noticia (detalle.html?id=N)
├── favoritos.html          Lista personalizada
├── publicar.html           Formulario de publicación
├── contacto.html           Formulario de contacto
├── css/
│   └── estilos.css         Sistema de diseño y estilos de todas las páginas
├── data/
│   └── noticias.json       Fuente de datos
├── img/
│   └── favicon.svg
└── js/
    ├── nucleo/             Lógica sin interfaz
    │   ├── almacenamiento.js   Acceso a localStorage
    │   ├── datos.js            Carga del JSON
    │   ├── favoritos.js        Lista de favoritos
    │   └── utilidades.js       Fechas, escape de HTML, avisos
    ├── componentes/        Piezas reutilizables de interfaz
    │   ├── estructura.js       Cabecera y pie
    │   ├── tarjeta.js          Tarjeta de noticia y botón de favorito
    │   └── validacion.js       Validación de formularios
    └── paginas/            Un archivo por página HTML
        ├── inicio.js
        ├── noticias.js
        ├── detalle.js
        ├── favoritos.js
        ├── publicar.js
        └── contacto.js
```

## Almacenamiento local

| Clave | Contenido |
|---|---|
| `noticreo:favoritos` | Arreglo con los id de las noticias guardadas |

## Tecnologías

HTML5, CSS3, JavaScript (módulos ES), Fetch API y Web Storage API. Tipografías Lora y Poppins de Google Fonts.

## Autor

Leyder Arlex Leal Carvajal
