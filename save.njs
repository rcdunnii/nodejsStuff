<?php
		require 'db.inc';
        
		$mysqli=  @ new mysqli($server,$user,$password, $database);
		
		/* check connection */
		if ($mysqli->connect_errno) {
			printf("Connect failed: %s\n", $mysqli->connect_error);
			exit();
		}
        
        $field = $_POST['name'];
        $id = $_POST['id'];
        $value = $_POST['value'];
 
		// create a prepared statement

		if ( !($stmt = $mysqli->prepare("UPDATE nuts SET $field=? WHERE walnutID=?"))) {
			 echo "Prepare failed: (" . $mysqli->errno . ") " . $mysqli->error;
			return;
		}

		// Bind parameters (an integer and a string). 'is' tells MySQL you're passing an integer(i) and a string(s)
		$stmt->bind_param('si', $value, $id); 

		if ($stmt == false) 
		{ // bind error
			printf("bind_param error: %s %d\n",$stmt->error,$stmt->errno);
			return;
		}
		
		$stmt->execute();
		
		if($stmt == false)
		{
			printf("execute: %s %d\n",$stmt->error,$stmt->errno);
			return;
		}
								
		$stmt->close();
			
		return;									

?>