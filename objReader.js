function loadObjFile(data) {
	var i;
	var j;
	var fcounter = 0;					
	
	var lines = data.split("\n");  		// Trataremos cada linha da entrada separadamente
	var lineElements;

	var vertexes = [];					// Vértices do objeto (recebidos pela entrada)
	var vertexNormals = [];				// Normais dos vértices (recebidos pela entrada e que servirão como normais para o Smooth Shading 1)
	var flatNormals = [];				// Normais calculadas para o Flat Shading
	var sumOfNormalsByVertex = [];		// Soma de normais para cada vértice (usada para Smooth Shading 2)
	var smooth2Normals = [];			// Normais calculadas para o Smooth Shading 2

	var faces = [];						// Vetor com a descrição das faces dos objetos recebidos pela entrada
	var faceVertexes;					// Cada face[i] tera n vértices, ou seja, a linha da face [i] tera n+1 lineElements (o 1º elemento é 'f')
	
	var hasNormals = 1;

	
	var vertices = [];					// Vértices na ordem em que devem ser desenhados
	
	var verticesNormals = [];			// Normais na ordem em que devem ser inseridas (sincronizadas com seus respectivos vértices)

	var vx;
	var vy;
	var vz;
	var vw;
	var xmin = Infinity;
	var xmax = -Infinity;
	var ymin = Infinity;
	var ymax = -Infinity;
	var zmin = Infinity;
	var zmax = -Infinity;

	var centroide;						// Calcula o centro geométrico do objeto
	var diametro;						// Diametro da esfera que contem o objeto todo

	for (i = 0; i < lines.length; i++) {
		lineElements = lines[i].split(/\s+/);
		if ( lineElements[0] == 'v') {															// Captura os vértices do arquivo .obj
			vx = parseFloat(lineElements[1]);
			vy = parseFloat(lineElements[2]);
			vz = parseFloat(lineElements[3]);
			if( vx > xmax) xmax = vx;
			if( vx < xmin) xmin = vx;
			if( vy > ymax) ymax = vy;
			if( vy < ymin) ymin = vy;
			if( vz > zmax) zmax = vz;
			if( vz < zmin) zmin = vz;

			if (lineElements[4]) {
				vw = parseFloat(lineElements[4]);
				vertexes.push( vec4( vx, vy, vz, vw ));											// Insere no vetor de vértices
				sumOfNormalsByVertex.push(vec4(0,0,0,0));
			} else {
				vertexes.push( vec4( vx, vy, vz, 1.0 ));										// Insere no vetor de vértices
				sumOfNormalsByVertex.push(vec4(0,0,0,0));
			}
		} else if ( lineElements[0] == 'vn') {													// Captura as normais do arquivo .obj
			vx = parseFloat(lineElements[1]);
			vy = parseFloat(lineElements[2]);
			vz = parseFloat(lineElements[3]);
			vertexNormals.push(vec4(vx,vy,vz,0));												// Insere no vetor de normais
		} else if ( lineElements[0] == 'f') {
			faces[fcounter] = [];																// Vetor com as discrições das faces 
			                                                                                    // faces[i] = (i+1)ésima face
			faceVertexes = [];

			for ( j = 1; j < lineElements.length; j++) { 										
				faceVertexes[j-1] = lineElements[j].split("/");
			}

			if(lineElements.length == 4){ /* Se a face possui 3 vértices */
				faces[fcounter].push(parseFloat(faceVertexes[0][0]));
				if ( faceVertexes[0][2] ) { faces[fcounter].push(parseFloat(faceVertexes[0][2])); }
				else { faces[fcounter].push(0); hasNormals = 0; }
				vertices.push(vertexes[(faceVertexes[0][0])-1]);
				if (faceVertexes[0][2] == "") { verticesNormals.push(vec4(0,0,0,0)); }
				else { verticesNormals.push(vertexNormals[(faceVertexes[0][2])-1]); }

				faces[fcounter].push(parseFloat(faceVertexes[1][0]));
				if ( faceVertexes[1][2] ) { faces[fcounter].push(parseFloat(faceVertexes[1][2])); }
				else { faces[fcounter].push(0); hasNormals = 0; }
				vertices.push(vertexes[(faceVertexes[1][0])-1]);
				if (faceVertexes[1][2] == "") { verticesNormals.push(vec4(0,0,0,0)); }
				else { verticesNormals.push(vertexNormals[(faceVertexes[1][2])-1]); }

				faces[fcounter].push(parseFloat(faceVertexes[2][0]));
				if ( faceVertexes[2][2] ) { faces[fcounter].push(parseFloat(faceVertexes[2][2])); }
				else { faces[fcounter].push(0); hasNormals = 0; }
				vertices.push(vertexes[(faceVertexes[2][0])-1]);
				if (faceVertexes[2][2] == "") { verticesNormals.push(vec4(0,0,0,0)); }
				else { verticesNormals.push(vertexNormals[(faceVertexes[2][2])-1]); }

			} 
			else if(lineElements.length == 5){  /* Se a face possui 4 vértices */
				faces[fcounter].push(parseFloat(faceVertexes[0][0]));
				if ( faceVertexes[0][2] ) { faces[fcounter].push(parseFloat(faceVertexes[0][2])); }
				else { faces[fcounter].push(0); hasNormals = 0; }
				vertices.push(vertexes[(faceVertexes[0][0])-1]);
				if (faceVertexes[0][2] == "") { verticesNormals.push(vec4(0,0,0,0)); }
				else { verticesNormals.push(vertexNormals[(faceVertexes[0][2])-1]); }

				faces[fcounter].push(parseFloat(faceVertexes[1][0]));
				if ( faceVertexes[1][2] ) { faces[fcounter].push(parseFloat(faceVertexes[1][2])); }
				else { faces[fcounter].push(0); hasNormals = 0; }
				vertices.push(vertexes[(faceVertexes[1][0])-1]);
				if (faceVertexes[1][2] == "") { verticesNormals.push(vec4(0,0,0,0)); }
				else { verticesNormals.push(vertexNormals[(faceVertexes[1][2])-1]); }

				faces[fcounter].push(parseFloat(faceVertexes[2][0]));
				if ( faceVertexes[2][2] ) { faces[fcounter].push(parseFloat(faceVertexes[2][2])); }
				else { faces[fcounter].push(0); hasNormals = 0; }
				vertices.push(vertexes[(faceVertexes[2][0])-1]);
				if (faceVertexes[2][2] == "") { verticesNormals.push(vec4(0,0,0,0)); }
				else { verticesNormals.push(vertexNormals[(faceVertexes[2][2])-1]); }

				faces[fcounter].push(parseFloat(faceVertexes[0][0]));
				if ( faceVertexes[0][2] ) { faces[fcounter].push(parseFloat(faceVertexes[0][2])); }
				else { faces[fcounter].push(0); hasNormals = 0; }
				vertices.push(vertexes[(faceVertexes[0][0])-1]);
				if (faceVertexes[0][2] == "") { verticesNormals.push(vec4(0,0,0,0)); }
				else { verticesNormals.push(vertexNormals[(faceVertexes[0][2])-1]); }

				faces[fcounter].push(parseFloat(faceVertexes[2][0]));
				if ( faceVertexes[2][2] ) { faces[fcounter].push(parseFloat(faceVertexes[2][2])); }
				else { faces[fcounter].push(0); hasNormals = 0; }
				vertices.push(vertexes[(faceVertexes[2][0])-1]);
				if (faceVertexes[2][2] == "") { verticesNormals.push(vec4(0,0,0,0)); }
				else { verticesNormals.push(vertexNormals[(faceVertexes[2][2])-1]); }

				faces[fcounter].push(parseFloat(faceVertexes[3][0]));
				if ( faceVertexes[3][2] ) { faces[fcounter].push(parseFloat(faceVertexes[3][2])); }
				else { faces[fcounter].push(0); hasNormals = 0; }
				vertices.push(vertexes[(faceVertexes[3][0])-1]);
				if (faceVertexes[3][2] == "") { verticesNormals.push(vec4(0,0,0,0)); }
				else { verticesNormals.push(vertexNormals[(faceVertexes[3][2])-1]); }
			}

//			for ( j = 1; j < lineElements.length; j++) { 										
//				faceVertexes[j-1] = lineElements[j].split("/");

//				faces[fcounter].push(parseFloat(faceVertexes[0])); 								// Pega um índice de vértice da definição de face
//				if ( faceVertexes[2] ) { faces[fcounter].push(parseFloat(faceVertexes[2])); }   // Pega um índice de normal da definição de face
//				else { faces[fcounter].push(0); hasNormals = 0; }								// Caso não haja uma normal, adcionamos o índice 0, que indica ausência de normal
//
//				vertices.push(vertexes[(faceVertexes[0])-1]);
//
//				if (faceVertexes[2] == "") { verticesNormals.push(vec4(0,0,0,0)); }				// Se o .obj não envia uma normal, a substituímos por um vetor vazio.
//				else { verticesNormals.push(vertexNormals[(faceVertexes[2])-1]); }				// Caso seja passada, adcionamos ao vetor de normais.
//			}

			fcounter++;
		}
	}

	centroide = vec3((xmin+xmax)/2, (ymin+ymax)/2, (zmin+zmax)/2);							

	diametro = Math.sqrt((xmax-xmin)*(xmax-xmin) 											
		               + (ymax-ymin)*(ymax-ymin) 
		               + (zmax-zmin)*(zmax-zmin));

	for( i = 0; i<faces.length; i++) {

		var t1 = subtract(vertexes[(faces[i][2])-1], vertexes[(faces[i][0])-1]);			// Calcula a normal da face (assim como realizado
     	var t2 = subtract(vertexes[(faces[i][4])-1], vertexes[(faces[i][2])-1]);			// no cálculo das faces do cubo de exemplo)
     	var normal = vec4(cross(t1, t2), 0);
		for( j = 0; j < faces[i].length; j+=2){
			flatNormals.push(normal);																	// As normais calculadas são então utilizadas para compltarmos o array de normais para o Flat Shading
			sumOfNormalsByVertex[(faces[i][j])-1] = add(sumOfNormalsByVertex[(faces[i][j])-1], normal); // Ao mesmo tempo em que são somadas ao vetor que usaremos para o Smooth Shading 2
		}
	}

	for (i = 0; i < faces.length; i++) {
		for( j = 0; j < faces[i].length; j+=2){
			smooth2Normals.push(normalize(sumOfNormalsByVertex[(faces[i][j])-1]));  // Não precisamos dividir a normal do vértice pelo número de faces ao seu redor
		}																			// pois ela será normalizada antes de ser utilizada pela renderização
	}

	return [vertices, verticesNormals, smooth2Normals, centroide, diametro, flatNormals, hasNormals];
}
