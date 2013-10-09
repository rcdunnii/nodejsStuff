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
		if (false === ($stmt = $mysqli->prepare("INSERT INTO nuts VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"))) {
			 echo "Prepare failed - addNut.php line 22: (" . $mysqli->errno . ") " . $mysqli->error;
			return;
		}

		// Bind parameters (an integer and a string). 'is' tells MySQL you're passing an integer(i) and a string(s)
        // No values are set for the last two fields - field 16 = Created, field 17 = Updated

		$rc = $stmt->bind_param('issssssssssssssss', $f["walnutID"],$f["SirName"],$f["Names"],$f["FormalNames"],$f["Children"],$f["Addr1"],$f["Addr2"],$f["Addr3"],$f["Addr4"],$f["Email1"],$f["Email2"],$f["Email3"],$f["Phone1"],$f["Phone2"],$f["Notes"],$f["Created"],$f["Updated"]); 

		if (false === $rc) 
		{ // bind error
			printf("bind_param error: %s %d\n",$stmt->error,$stmt->errno);
			return;
		}
        
        $f["Created"] = 'NOW()';
        $f["Updated"] = null;		
        
		$rc = $stmt->execute();
		
		if (false === $rc) 
		{
			printf("execute: %s %d\n",$stmt->error,$stmt->errno);
			return;
		}
        
		$notification = (IsNullOrEmptyString($f["Names"])) ? $f["SirName"] : $f["Names"];
       
		printf("Added %s" , $notification);
        
		$stmt->close();															 
	
		return;
?>