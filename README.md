# quilt
a quilt pattern generator

so far:

- grey guidelines show 6x2 sided symmetry (this is adapted from a snowflake generator, can you tell)
- click three red dots to make triangles
- keep going to make patterns
- save as SVG at the top left

to do:

- the svg exporter doesn't really work well, I haven't looked into it at all; it's whatever GPT spat out the first time. it does save _an_ SVG, but the blocking and fills are all inconsistent to the canvas version
- make a better top bar to clean up the SVG programmer art + a clear button and some settings
- options for symmetry type?
- options for grid (probably isometric?) to make more realistically useful quilting squares and triangles that line up with each other and are feasible to cut geometrically
- quantize / snap the dots to grid intersections
- allow drawing filled N-gons instead of triangles with more sides to make complex shapes
- maybe a grid scale with real measurements so you could adapt patterns to a cutting board?
- SVGs already mostly work for this, but maybe some sort of save as PDF (at scale) for printing out paper templates?
- multiple colours? some sort of simple MS paint type swatch bar at the bottom?

