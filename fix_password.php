<?php

// Corrigir a senha do usuário guilherme.cruz
$host = 'localhost';
$dbname = 'brs_database';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== CORRIGINDO SENHA DO USUÁRIO ===\n";
    
    // Buscar o usuário guilherme.cruz
    $stmt = $pdo->prepare("SELECT id, nome, Usuario, email, Senha FROM usuarios WHERE Usuario = ?");
    $stmt->execute(['guilherme.cruz']);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo "Usuário encontrado:\n";
        echo "ID: " . $user['id'] . "\n";
        echo "Nome: " . $user['nome'] . "\n";
        echo "Usuário: " . $user['Usuario'] . "\n";
        echo "Email: " . $user['email'] . "\n";
        echo "Hash atual: " . $user['Senha'] . "\n";
        
        // Gerar novo hash para a senha 123456
        $newPassword = '123456';
        $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
        
        echo "\nGerando novo hash para senha '$newPassword'...\n";
        echo "Novo hash: " . $newHash . "\n";
        
        // Atualizar a senha
        $updateStmt = $pdo->prepare("UPDATE usuarios SET Senha = ? WHERE id = ?");
        $result = $updateStmt->execute([$newHash, $user['id']]);
        
        if ($result) {
            echo "\n✅ Senha atualizada com sucesso!\n";
            
            // Verificar se a nova senha funciona
            $isValid = password_verify($newPassword, $newHash);
            echo "Teste da nova senha: " . ($isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA') . "\n";
            
            // Testar com diferentes métodos
            echo "\n=== TESTES ADICIONAIS ===\n";
            
            // Teste com password_verify
            $test1 = password_verify('123456', $newHash);
            echo "password_verify('123456'): " . ($test1 ? '✅ VÁLIDA' : '❌ INVÁLIDA') . "\n";
            
            // Teste com password_verify usando variável
            $test2 = password_verify($newPassword, $newHash);
            echo "password_verify(\$newPassword): " . ($test2 ? '✅ VÁLIDA' : '❌ INVÁLIDA') . "\n";
            
            // Testar outras senhas para garantir que não funcionam
            $wrongPasswords = ['123456789', 'admin', 'password', '12345'];
            foreach ($wrongPasswords as $wrongPass) {
                $test = password_verify($wrongPass, $newHash);
                echo "password_verify('$wrongPass'): " . ($test ? '✅ VÁLIDA' : '❌ INVÁLIDA') . "\n";
            }
            
        } else {
            echo "\n❌ Erro ao atualizar senha\n";
        }
    } else {
        echo "❌ Usuário guilherme.cruz não encontrado!\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Erro de conexão: " . $e->getMessage() . "\n";
}
