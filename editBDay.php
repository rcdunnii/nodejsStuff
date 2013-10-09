<?php
        /* called by ajaxEditBDay() js function in main.js */
		require 'db.inc';
        
		include_once($_SERVER["DOCUMENT_ROOT"] . "/functions.php");	
        
		$mysqli=  @ new mysqli($server,$user,$password, $database );
		
		/* check connection */
		if ($mysqli->connect_errno) {
			printf("Connect failed: %s\n", $mysqli->connect_error);
			exit();
		}
        
	    $f =($_POST['data']); 
        
		// create a prepared statement 
		if ( !($stmt = $mysqli->prepare("UPDATE bdays SET FirstName=?, MiddleInit=?, LastName=?, bDayYYYY=?, bDayMM=?, bDayDD=? WHERE bDayID=?"))) {
			 echo "Prepare failed: (" . $mysqli->errno . ") " . $mysqli->error;
			return;
		}

		// Bind parameters (an integer and a string). 'is' tells MySQL you're passing an integer(i) and a string(s)
		$stmt->bind_param('ssssssi', $f["FirstName"],$f["MiddleInit"],$f["LastName"],$f["bDayYYYY"],$f["bDayMM"],$f["bDayDD"], $f["bDayID"]); 

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
        
		printf("Edited %s %s %s" , $f["FirstName"], $f["MiddleInit"], $f["LastName"]);
			
		return;									

?>