function Object(objVertexes, objFlatNormals, objSmoothNormals){
	this.objVertexes = objVertexes;
	this.objFlatNormals = objFlatNormals;
	this.objSmoothNormals = objSmoothNormals;

	this.createObjBuffers = function(points, normals) {
		var nBuffer = gl.createBuffer();
    	gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    	gl.bufferData( gl.ARRAY_BUFFER, flatten(this.objFlatNormals), gl.STATIC_DRAW );
    
    	var vNormal = gl.getAttribLocation( program, "vNormal" );
    	gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    	gl.enableVertexAttribArray( vNormal );

    	var vBuffer = gl.createBuffer();
    	gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    	gl.bufferData( gl.ARRAY_BUFFER, flatten(this.objVertexes), gl.STATIC_DRAW );
    
    	var vPosition = gl.getAttribLocation(program, "vPosition");
    	gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    	gl.enableVertexAttribArray(vPosition);
	}

	this.drawArrays = function() {
		gl.drawArrays( gl.TRIANGLES, 0, this.objVertexes.length );
	}

}