<?php
		require 'db.inc';
        
		include_once($_SERVER["DOCUMENT_ROOT"] . "/functions.php");
        
		$mysqli = @ new mysqli($server, $user, $password, $database);
		
		/* check connection */
		if ($mysqli->connect_errno) {
			printf("Connect failed: %s\n", $mysqli->connect_error);
			exit();
		}

        $f =($_POST['data']);         
                  
		// create a prepared statement 
		if (false === ($stmt = $mysqli->prepare("INSERT INTO bdays VALUES (?,?,?,?,?,?,?,?)"))) {
			 echo "Prepare failed - addBDay.php line 17: (" . $mysqli->errno . ") " . $mysqli->error;
			return;
		}

		// Bind parameters (an integer and a string). 'is' tells MySQL you're passing an integer(i) and a string(s)

		$rc = $stmt->bind_param('issssssi', $f["bDayID"],$f["FirstName"],$f["MiddleInit"],$f["LastName"],$f["bDayYYYY"],$f["bDayMM"],$f["bDayDD"], $f["WalnutID"]); 

		if (false === $rc) 
		{ // bind error
			printf("bind_param error: %s %d\n",$stmt->error,$stmt->errno);
			return;
		}
        
		$rc = $stmt->execute();
		
		if (false === $rc) 
		{
			printf("execute: %s %d\n",$stmt->error,$stmt->errno);
			return;
		}
       
		printf("Added Birthday for %s %s %s" , $f["FirstName"], $f["MiddleInit"], $f["LastName"]);
        
		$stmt->close();															 
	
		return;
?>